import { apiRequest } from "@/lib/queryClient";
import type { ChatSession, Message, RestaurantInfo } from "@shared/schema";

export const chatApi = {
  createSession: async (username: string): Promise<ChatSession> => {
    const response = await apiRequest("POST", "/api/chat/session", { username });
    return response.json();
  },

  getMessages: async (sessionId: number): Promise<Message[]> => {
    const response = await apiRequest("GET", `/api/chat/session/${sessionId}/messages`);
    return response.json();
  },

  sendMessage: async (sessionId: number, content: string): Promise<{ userMessage: Message; aiMessage: Message }> => {
    const response = await apiRequest("POST", "/api/chat/message", {
      sessionId,
      content,
      isAI: false,
    });
    return response.json();
  },
};

export const restaurantApi = {
  getInfo: async (): Promise<RestaurantInfo> => {
    const response = await apiRequest("GET", "/api/restaurant/info");
    return response.json();
  },
};
