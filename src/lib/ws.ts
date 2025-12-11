// src/lib/ws.ts

export class SalesAgentClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Callback untuk update UI
    public onMessage: ((message: string) => void) | null = null;
    public onStatusChange: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null = null;

    constructor(
        private companyId: string,
        private sessionId: string,
        private baseUrl: string
    ) { }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.onStatusChange?.('connecting');

        // Susun URL sesuai format di WS-TO-ENGINE.md
        // Format: {WS_BASE_URL}/ws/{session_id}?company_id={id}
        const url = `${this.baseUrl}/ws/${this.sessionId}?company_id=${this.companyId}`;

        console.log('Connecting to:', url);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Sales Agent Connected');
            this.onStatusChange?.('connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            if (this.onMessage) {
                this.onMessage(event.data);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.onStatusChange?.('error');
        };

        this.ws.onclose = () => {
            console.log('Sales Agent Disconnected');
            this.onStatusChange?.('disconnected');
            this.ws = null;

            // Auto-reconnect sederhana
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, 2000 * this.reconnectAttempts);
            }
        };
    }

    send(message: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.warn('WebSocket not connected, trying to reconnect...');
            this.connect();
            // Opsional: Antrikan pesan atau beri notifikasi error
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Helper untuk generate Session ID sederhana
export const getOrCreateSessionId = (): string => {
    const STORAGE_KEY = 'sales_agent_session_id';
    let sessionId = localStorage.getItem(STORAGE_KEY);

    if (!sessionId) {
        sessionId = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(STORAGE_KEY, sessionId);
    }

    return sessionId;
};