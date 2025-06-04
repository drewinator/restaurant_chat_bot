import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { WelcomeModal } from "@/components/welcome-modal";
import { ChatInterface } from "@/components/chat-interface";
import { useToast } from "@/hooks/use-toast";
import type { ChatSession } from "@shared/schema";

export default function Chat() {
  const [username, setUsername] = useState<string>("");
  const [session, setSession] = useState<ChatSession | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: (username: string) => chatApi.createSession(username),
    onSuccess: (newSession) => {
      setSession(newSession);
      setShowWelcome(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chat session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUsernameSubmit = (submittedUsername: string) => {
    setUsername(submittedUsername);
    createSessionMutation.mutate(submittedUsername);
  };

  useEffect(() => {
    // Check if user has already provided username in this session
    const savedUsername = sessionStorage.getItem("bodegoes_username");
    if (savedUsername) {
      setUsername(savedUsername);
      createSessionMutation.mutate(savedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      sessionStorage.setItem("bodegoes_username", username);
    }
  }, [username]);

  if (showWelcome) {
    return <WelcomeModal onUsernameSubmit={handleUsernameSubmit} />;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-bodegoes border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your chat session...</p>
        </div>
      </div>
    );
  }

  return <ChatInterface username={username} session={session} />;
}
