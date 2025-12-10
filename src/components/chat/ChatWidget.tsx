import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChatMessage, Product } from '@/types';

interface ChatWidgetProps {
  productContext?: {
    product_id: string;
    name: string;
  };
}

export function ChatWidget({ productContext }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI shopping assistant. Ask me anything about our products, shipping, returns, or get personalized recommendations!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add product context message when product changes
  useEffect(() => {
    if (productContext && isOpen) {
      const contextMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I see you're looking at **${productContext.name}**. Would you like to know more about its features, availability, or pricing?`,
        timestamp: new Date(),
        productContext,
      };
      
      // Only add if not already present
      const hasContext = messages.some(m => m.productContext?.product_id === productContext.product_id);
      if (!hasContext) {
        setMessages(prev => [...prev, contextMessage]);
      }
    }
  }, [productContext, isOpen]);

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerMessage = userMessage.toLowerCase();

    // Product-related queries
    if (productContext) {
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('harga')) {
        return `The **${productContext.name}** is competitively priced. For real-time pricing and stock availability, our system fetches the latest data from the backend. Would you like me to check the current availability for you?`;
      }
      if (lowerMessage.includes('stock') || lowerMessage.includes('available') || lowerMessage.includes('stok')) {
        return `I can check the real-time stock for **${productContext.name}** from our inventory system. Based on the latest data, this product is currently in stock. Would you like to add it to your cart?`;
      }
      if (lowerMessage.includes('spec') || lowerMessage.includes('feature') || lowerMessage.includes('detail')) {
        return `**${productContext.name}** comes with premium features and specifications. You can see the detailed specifications on the product page. Is there a specific feature you'd like to know more about?`;
      }
    }

    // General queries
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('pengiriman')) {
      return "We offer **free shipping** on orders over Rp 1,000,000! Standard delivery takes 3-5 business days, and express shipping (1-2 days) is available for an additional fee. Would you like more details about our shipping policies?";
    }
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('retur')) {
      return "We have a **30-day return policy** for all products in original condition. Items must have all original packaging and accessories. The refund will be processed within 5-7 business days after we receive the returned item.";
    }
    if (lowerMessage.includes('warranty') || lowerMessage.includes('garansi')) {
      return "All products come with **manufacturer warranty**. Extended warranty options are available at checkout for most electronics. Warranty periods vary by product - typically 1-3 years for electronics.";
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('rekomendasi')) {
      return "Based on popular choices, I'd recommend checking out:\n\n• **ASUS ROG Strix G16** - Best for gaming\n• **MacBook Pro M3 Max** - Best for professionals\n• **Sony WH-1000XM5** - Best headphones\n\nWould you like details on any of these?";
    }
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('bayar')) {
      return "We accept various payment methods including:\n\n• Credit/Debit Cards (Visa, Mastercard)\n• Bank Transfer\n• E-wallets (GoPay, OVO, Dana)\n• Virtual Account\n• COD (for select areas)\n\nAll transactions are secured with SSL encryption.";
    }

    // Default response
    return "That's a great question! I'm here to help you with product information, pricing, stock availability, shipping, returns, and personalized recommendations. What would you like to know more about?";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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

    try {
      const response = await simulateAIResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        variant="chat"
        size="iconLg"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 shadow-chat",
          isOpen && "hidden"
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border bg-card shadow-chat transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b gradient-primary rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">AI Assistant</h3>
              <p className="text-xs text-primary-foreground/80">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
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
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  message.role === 'user'
                    ? 'gradient-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">
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
              <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              variant="chat"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              variant="chat"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {productContext && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Viewing: {productContext.name}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
