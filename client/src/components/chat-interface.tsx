import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  isUser?: boolean;
}

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['/api/chat/history'],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { message });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gates'] });
      setIsTyping(false);
      setMessage("");
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      chatMutation.mutate(message.trim());
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    chatMutation.mutate(question);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  // Prepare messages for display
  const displayMessages: any[] = [];
  
  // Add initial bot message
  displayMessages.push({
    id: 'initial',
    isBot: true,
    content: "Hello! I can help you monitor crowd levels at different gates. Try asking \"How many people at Gate A?\""
  });

  // Add chat history
  chatHistory.forEach((chat: any) => {
    displayMessages.push({
      id: `${chat.id}-user`,
      isBot: false,
      content: chat.message
    });
    displayMessages.push({
      id: `${chat.id}-bot`,
      isBot: true,
      content: chat.response
    });
  });

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-fade-in animate-float shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center animate-slide-in-left">
        <Bot className="text-cyan-400 mr-3 animate-glow" size={24} />
        AI Crowd Assistant
      </h2>
      
      <div className="bg-slate-800/50 rounded-xl p-4 h-80 overflow-y-auto mb-4 space-y-4">
        {displayMessages.map((msg) => (
          <div key={msg.id} className={`flex items-start space-x-3 ${msg.isBot ? '' : 'justify-end'}`}>
            {msg.isBot && (
              <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={14} />
              </div>
            )}
            
            <div className={`rounded-lg px-4 py-2 max-w-xs ${
              msg.isBot 
                ? 'bg-slate-700 text-slate-100' 
                : 'bg-blue-600 text-white'
            }`}>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
            
            {!msg.isBot && (
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white" size={14} />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white" size={14} />
            </div>
            <div className="bg-slate-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Ask about crowd levels..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400"
          disabled={chatMutation.isPending}
        />
        <Button 
          type="submit" 
          className="gradient-primary hover:opacity-90"
          disabled={chatMutation.isPending || !message.trim()}
        >
          <Send size={16} />
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
          onClick={() => handleQuickQuestion("Gate B status?")}
          disabled={chatMutation.isPending}
        >
          Gate B status?
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
          onClick={() => handleQuickQuestion("Which gate is busiest?")}
          disabled={chatMutation.isPending}
        >
          Which gate is busiest?
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
          onClick={() => handleQuickQuestion("Show me all gates")}
          disabled={chatMutation.isPending}
        >
          Show me all gates
        </Button>
      </div>
    </div>
  );
}
