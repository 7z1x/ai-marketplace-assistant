import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SalesAgentClient, getOrCreateSessionId } from '@/lib/ws';
import { API_CONFIG } from '@/config/api';
import type { ChatMessage } from '@/types';

interface ChatWidgetProps {
  productContext?: {
    product_id: string;
    name: string;
  };
  // Props untuk mengontrol buka/tutup dari component induk (misal: tombol CTA di Home)
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChatWidget({ productContext, isOpen: externalIsOpen, onOpenChange }: ChatWidgetProps) {
  // State Internal (dipakai jika tidak ada kontrol dari luar)
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Menentukan apakah widget terbuka berdasarkan props atau state internal
  const isWidgetOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // Helper untuk mengubah state buka/tutup
  const toggleOpen = (newState: boolean) => {
    if (onOpenChange) {
      onOpenChange(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  // State Chat & Koneksi
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI shopping assistant. Ask me anything about our products, stock, or personalized recommendations!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [agentClient, setAgentClient] = useState<SalesAgentClient | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isWidgetOpen) {
      scrollToBottom();
    }
  }, [messages, isWidgetOpen]);

  // --- LOGIKA WEBSOCKET ---
  useEffect(() => {
    const sessionId = getOrCreateSessionId();

    // Inisialisasi Client menggunakan konfigurasi dari API_CONFIG
    const client = new SalesAgentClient(
      API_CONFIG.COMPANY_ID,
      sessionId,
      API_CONFIG.WS_BASE_URL
    );

    // Handler ketika pesan diterima dari AI
    client.onMessage = (text) => {
      setIsLoading(false);

      setMessages(prev => {
        return [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          timestamp: new Date()
        }];
      });
    };

    // Handler status koneksi
    client.onStatusChange = (status) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        setIsLoading(false);
      }
    };

    // Mulai koneksi
    client.connect();
    setAgentClient(client);

    // Cleanup saat component di-unmount
    return () => {
      client.disconnect();
    };
  }, []);

  // --- LOGIKA PENGIRIMAN PESAN ---
  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Tampilkan pesan user di UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      productContext,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 2. Kirim ke WebSocket
    if (agentClient && connectionStatus === 'connected') {
      agentClient.send(userMessage.content);
    } else {
      // Fallback jika koneksi terputus
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "⚠️ Connection lost. Trying to reconnect...",
        timestamp: new Date()
      }]);
      agentClient?.connect(); // Coba connect ulang
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- LOGIKA CONTEXT PRODUK ---
  useEffect(() => {
    if (productContext && isWidgetOpen) {
      const contextMessageId = `ctx-${productContext.product_id}`;

      const hasContext = messages.some(m => m.id === contextMessageId || m.productContext?.product_id === productContext.product_id);

      if (!hasContext) {
        const contextMessage: ChatMessage = {
          id: contextMessageId,
          role: 'assistant',
          content: `I see you're looking at **${productContext.name}**. Would you like to check stock or negotiate the price?`,
          timestamp: new Date(),
          productContext,
        };
        setMessages(prev => [...prev, contextMessage]);
      }
    }
  }, [productContext, isWidgetOpen]);

  return (
    <>
      {/* Chat Button */}
      <Button
        variant="chat"
        size="iconLg"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 shadow-chat transition-transform duration-300 hover:scale-110",
          isWidgetOpen && "hidden"
        )}
        onClick={() => toggleOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
        {/* Indikator Status di tombol jika error */}
        {connectionStatus === 'error' || connectionStatus === 'disconnected' ? (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
        ) : null}
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border bg-card shadow-chat transition-all duration-300 origin-bottom-right",
          isWidgetOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b gradient-primary rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {/* Indikator Status Koneksi */}
              <span className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary transition-colors duration-500",
                connectionStatus === 'connected' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" :
                  connectionStatus === 'connecting' ? "bg-yellow-400 animate-pulse" : "bg-red-500"
              )} title={`Status: ${connectionStatus}`} />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">AI Assistant</h3>
              <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                {connectionStatus === 'connected' ? 'Online & Ready' :
                  connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => toggleOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex animate-slide-up",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  message.role === 'user'
                    ? 'gradient-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card text-card-foreground border border-border/50 rounded-bl-sm'
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0 leading-relaxed">
                      {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-card border border-border/50 text-muted-foreground rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">AI is typing...</span>
                </div>
              </div>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-destructive/10 text-destructive text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Connection lost
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card rounded-b-2xl">
          <div className="flex gap-2">
            <Input
              variant="chat"
              placeholder={connectionStatus === 'connected' ? "Ask about products, stock..." : "Connecting..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={connectionStatus !== 'connected'}
              className="flex-1 shadow-inner bg-muted/30"
            />
            <Button
              variant="chat"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || connectionStatus !== 'connected'}
              className={cn(
                "transition-all duration-200",
                input.trim() ? "scale-100 opacity-100" : "scale-90 opacity-70"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {productContext && (
            <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Context: {productContext.name}
            </p>
          )}
        </div>
      </div>
    </>
  );
}