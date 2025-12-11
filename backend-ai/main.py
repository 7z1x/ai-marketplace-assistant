import asyncio
import websockets
import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs

# 1. Konfigurasi Awal
load_dotenv()
logging.basicConfig(level=logging.INFO)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ Error: GEMINI_API_KEY tidak ditemukan di file .env")
    exit(1)

genai.configure(api_key=API_KEY)

# --- FUNGSI BARU: Load Data dari mockProduct.json ---
def load_products_context():
    try:
        # Trik agar Path selalu benar:
        # Ambil lokasi folder dimana file main.py ini berada
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Gabungkan dengan nama file JSON kamu
        json_path = os.path.join(current_dir, 'mockProduct.json')

        # Cek apakah file ada
        if not os.path.exists(json_path):
            print(f"⚠️ File tidak ditemukan di: {json_path}")
            return "Data produk sedang tidak tersedia."

        # Buka file JSON
        with open(json_path, 'r') as file:
            products = json.load(file)
        
        # Format JSON menjadi String yang mudah dibaca AI
        products_str = ""
        for i, p in enumerate(products, 1):
            # Format harga ke Rupiah (Pastikan key di JSON kamu 'price', 'name', dll sesuai)
            # Menggunakan .get() agar tidak error jika ada data kosong
            nama = p.get('name', 'Produk Tanpa Nama')
            harga = p.get('price', 0)
            stok = p.get('stock', 0)
            spek = p.get('specs', '-') # Atau 'content' jika mengikuti mockProducts.ts asli
            
            harga_formatted = f"Rp {harga:,}".replace(',', '.')
            
            products_str += f"{i}. {nama}\n"
            products_str += f"   - Harga: {harga_formatted}\n"
            products_str += f"   - Stok: {stok} unit\n"
            products_str += f"   - Spesifikasi: {spek}\n"
        
        # Masukkan ke dalam System Prompt Utama
        base_prompt = f"""
        Kamu adalah Sales Assistant untuk "TechStore". Jawablah dengan ramah, singkat, dan membantu.
        Gunakan data produk LIVE berikut untuk menjawab pertanyaan user:

        DAFTAR PRODUK TERBARU:
        {products_str}

        ATURAN PENTING:
        - HANYA jawab berdasarkan data di atas. Jangan mengarang produk lain.
        - Jika ditanya stok, sebutkan angka pastinya dari data.
        - Jika stok 0, katakan barang habis.
        - Jika user ingin membeli, arahkan untuk klik "Add to Cart".
        - Gunakan Bahasa Indonesia yang natural dan sopan.
        """
        return base_prompt

    except Exception as e:
        print(f"❌ Error membaca mockProduct.json: {e}")
        return "Sistem sedang maintenance data produk."

# 2. Inisialisasi Model
# Kita load context saat server pertama kali jalan
initial_context = load_products_context()
print("✅ Data Produk Berhasil Dimuat dari JSON ke Otak AI")

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    system_instruction=initial_context
)

# 3. Handler WebSocket
async def chat_handler(websocket):
    # AMBIL path manual dari properti request
    path = websocket.request.path
    
    # Parsing URL untuk validasi
    parsed_path = urlparse(path)
    if not parsed_path.path.startswith("/ws/"):
        print(f"⚠️ Koneksi ditolak: Path salah ({path})")
        return

    session_id = parsed_path.path.split("/")[-1]
    query_params = parse_qs(parsed_path.query)
    company_id = query_params.get('company_id', [''])[0]

    print(f"⚡ Client Connected! Session: {session_id}, Company: {company_id}")

    # Mulai Sesi Chat Gemini
    chat_session = model.start_chat(history=[])

    try:
        # Kirim sapaan awal
        await websocket.send("Halo! Saya AI Assistant TechStore. Ada yang bisa saya bantu cari hari ini?")

        async for message in websocket:
            print(f"📩 User ({session_id}): {message}")

            # Kirim ke Gemini
            response = chat_session.send_message(message)
            ai_reply = response.text

            print(f"🤖 AI: {ai_reply}")
            
            # Kirim Balasan ke Frontend
            await websocket.send(ai_reply)

    except websockets.exceptions.ConnectionClosed:
        print(f"❌ Client Disconnected: {session_id}")
    except Exception as e:
        print(f"🔥 Error: {e}")

# 4. Jalankan Server
async def main():
    PORT = 8001
    print(f"🚀 AI Server (Python + JSON) berjalan di ws://0.0.0.0:{PORT}")
    async with websockets.serve(chat_handler, "0.0.0.0", PORT):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())