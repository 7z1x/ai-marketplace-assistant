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

# 2. Data Produk (Knowledge Base Sederhana)
PRODUCTS_CONTEXT = """
Kamu adalah Sales Assistant untuk "TechStore". Jawablah dengan ramah, singkat, dan membantu.
Gunakan data produk berikut untuk menjawab pertanyaan user:

DAFTAR PRODUK:
1. ASUS ROG Strix G16 Gaming Laptop
   - Harga: Rp 28.999.000
   - Stok: 15 unit
   - Specs: i9-14900HX, RTX 4070, 32GB RAM
2. MacBook Pro 16" M3 Max
   - Harga: Rp 52.999.000
   - Stok: 8 unit
   - Specs: M3 Max chip, 48GB RAM, 1TB SSD
3. LG UltraGear 27" 4K Monitor
   - Harga: Rp 8.499.000
   - Stok: 25 unit
4. Logitech G Pro X Superlight 2
   - Harga: Rp 2.299.000
   - Stok: 42 unit
5. Sony WH-1000XM5 Headphones
   - Harga: Rp 5.499.000
   - Stok: 30 unit

ATURAN:
- Jika ditanya stok, sebutkan angkanya.
- Jika user ingin membeli, arahkan untuk klik "Add to Cart".
- Gunakan Bahasa Indonesia yang natural dan sopan.
- Jangan mengarang produk yang tidak ada di daftar.
"""

# Inisialisasi Model Gemini
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=PRODUCTS_CONTEXT
)

# 3. Handler WebSocket (DIPERBAIKI)
# HAPUS parameter 'path' dari definisi fungsi
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
    print(f"🚀 AI Server (Python) berjalan di ws://localhost:{PORT}")
    # Gunakan serve tanpa passing path explicit di handler
    async with websockets.serve(chat_handler, "0.0.0.0", PORT):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())