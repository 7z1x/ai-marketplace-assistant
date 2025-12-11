// ai-server.ts
import type { ServerWebSocket } from "bun";

const PORT = 8001;

console.log(`🤖 AI Engine is running on ws://localhost:${PORT}`);

Bun.serve({
    port: PORT,
    fetch(req, server) {
        // Cek apakah request adalah upgrade ke WebSocket
        if (server.upgrade(req)) {
            return; // Bun otomatis menangani upgrade
        }
        return new Response("AI Engine HTTP Server Online");
    },
    websocket: {
        open(ws: ServerWebSocket) {
            console.log("⚡ Client connected!");
            // Kirim pesan sambutan saat koneksi terbuka
            ws.send("Halo! Saya AI Assistant (Mock Server). Ada yang bisa dibantu?");
        },
        message(ws: ServerWebSocket, message: string | Buffer) {
            console.log(`📩 Received: ${message}`);

            // Simulasi mikir (delay 1 detik)
            setTimeout(() => {
                // Logic jawaban sederhana
                const msg = message.toString().toLowerCase();
                let reply = "Maaf, saya belum paham konteks itu.";

                if (msg.includes("stok") || msg.includes("stock")) {
                    reply = "Untuk stok, saya cek di database... Aman! Laptop ROG masih ada 25 unit.";
                } else if (msg.includes("harga") || msg.includes("price")) {
                    reply = "Harganya Rp 15.999.000, Kak. Sedang ada promo cashback lho!";
                } else if (msg.includes("halo") || msg.includes("hi")) {
                    reply = "Halo juga! Mau cari laptop atau aksesoris gaming hari ini?";
                }

                ws.send(reply);
            }, 1000);
        },
        close(ws: ServerWebSocket) {
            console.log("❌ Client disconnected");
        },
    },
});