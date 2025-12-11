import { WebSocketServer } from 'ws';

const PORT = 8001;

// Membuat WebSocket Server di port 8001
const wss = new WebSocketServer({ port: PORT });

console.log(`🤖 AI Engine (Node.js) is running on ws://localhost:${PORT}`);

wss.on('connection', function connection(ws) {
    console.log("⚡ Client connected!");

    // Kirim sapaan awal
    ws.send("Halo! Saya AI Assistant (Mock Server Node.js). Ada yang bisa dibantu?");

    ws.on('message', function message(data) {
        // Ubah buffer ke string
        const messageStr = data.toString();
        console.log(`📩 Received: ${messageStr}`);

        // Simulasi mikir (delay 1 detik)
        setTimeout(() => {
            const msg = messageStr.toLowerCase();
            let reply = "Maaf, saya belum paham konteks itu.";

            // Logika jawaban sederhana
            if (msg.includes("stok") || msg.includes("stock")) {
                reply = "Untuk stok, saya cek di database... Aman! Laptop ROG masih ada 25 unit.";
            } else if (msg.includes("harga") || msg.includes("price")) {
                reply = "Harganya Rp 15.999.000, Kak. Sedang ada promo cashback lho!";
            } else if (msg.includes("halo") || msg.includes("hi")) {
                reply = "Halo juga! Mau cari laptop atau aksesoris gaming hari ini?";
            }

            ws.send(reply);
        }, 1000);
    });

    ws.on('close', () => {
        console.log("❌ Client disconnected");
    });
});