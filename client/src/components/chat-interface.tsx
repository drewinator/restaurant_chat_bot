import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantInfo } from "./restaurant-info";
import { Bot, User, Info, MoreVertical, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message, ChatSession } from "@shared/schema";

interface ChatInterfaceProps {
  username: string;
  session: ChatSession;
}

export function ChatInterface({ username, session }: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const [showRestaurantInfo, setShowRestaurantInfo] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/session", session.id, "messages"],
    queryFn: () => chatApi.getMessages(session.id),
  });



  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(session.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/session", session.id, "messages"] });
      setMessageInput("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (content && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInfoToggle = () => {
    if (window.innerWidth >= 1024) {
      setShowRestaurantInfo(!showRestaurantInfo);
    } else {
      setShowMobileInfo(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendMessageMutation.isPending]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [messageInput]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserInitials = () => username.charAt(0).toUpperCase();

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-bodegoes to-bodegoes-dark rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Bodegoes Assistant</h1>
            <p className="text-sm text-green-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInfoToggle}
            className="p-2 text-gray-600 hover:text-bodegoes"
          >
            <Info size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-bodegoes">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-scroll">
            
            {/* Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-bodegoes to-bodegoes-dark rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={14} />
              </div>
              <div className="flex-1">
                <Card className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-gray-800">Hi {username}! 👋 I'm your Bodegoes assistant. I can help you with:</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Menu items and pricing</li>
                    <li>• Restaurant hours and location</li>
                    <li>• Making reservations</li>
                    <li>• Special offers and events</li>
                  </ul>
                  <p className="mt-2 text-gray-800">What would you like to know?</p>
                </Card>
                <p className="text-xs text-gray-500 mt-1 ml-2">Just now</p>
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${message.isAI ? "" : "flex-row-reverse space-x-reverse"}`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.isAI ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-bodegoes to-bodegoes-dark rounded-full flex items-center justify-center">
                      <Bot className="text-white" size={14} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                    </div>
                  )}
                </div>
                
                <div className={`${message.isAI ? "flex-1" : "max-w-xs sm:max-w-md"}`}>
                  <Card className={`px-4 py-3 ${
                    message.isAI 
                      ? "bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-100" 
                      : "bg-gradient-to-r from-bodegoes to-bodegoes-dark text-white rounded-2xl rounded-tr-md"
                  }`}>
                    <p className={message.isAI ? "text-gray-800" : "text-gray-900 font-medium"}>
                      {message.content}
                    </p>
                  </Card>
                  <p className={`text-xs text-gray-500 mt-1 ${message.isAI ? "ml-2" : "mr-2 text-right"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-bodegoes to-bodegoes-dark rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={14} />
                </div>
                <Card className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me about Bodegoes..."
                  className="min-h-[44px] max-h-32 resize-none rounded-2xl"
                  rows={1}
                />
              </div>
              <Button 
                type="submit" 
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-bodegoes to-bodegoes-dark hover:from-bodegoes-dark hover:to-bodegoes text-white p-3 rounded-full flex-shrink-0"
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>

        {/* Restaurant Info Sidebar */}
        {showRestaurantInfo && (
          <div className="hidden lg:block">
            <RestaurantInfo />
          </div>
        )}
      </div>

      {/* Mobile Restaurant Info Modal */}
      {showMobileInfo && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Restaurant Info</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileInfo(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                  alt="Bodegoes Restaurant Interior" 
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
                <h4 className="font-bold text-xl text-gray-900">Bodegoes</h4>
                <p className="text-gray-600">Mediterranean Cuisine</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <Bot className="text-green-600 text-xl mb-2 mx-auto" size={24} />
                  <p className="text-sm font-medium text-green-800">Open Now</p>
                  <p className="text-xs text-green-600">Until 10:00 PM</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <Bot className="text-yellow-500 text-xl mb-2 mx-auto" size={24} />
                  <p className="text-sm font-medium text-blue-800">4.5 Stars</p>
                  <p className="text-xs text-blue-600">324 reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
