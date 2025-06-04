import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils } from "lucide-react";

interface WelcomeModalProps {
  onUsernameSubmit: (username: string) => void;
}

export function WelcomeModal({ onUsernameSubmit }: WelcomeModalProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onUsernameSubmit(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-bodegoes to-bodegoes-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="text-white text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Bodegoes!</h2>
            <p className="text-gray-600">I'm your AI assistant. I can help you with menu information, hours, reservations, and more!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name to get started
              </Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name..."
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-bodegoes to-bodegoes-dark hover:from-bodegoes-dark hover:to-bodegoes text-white font-semibold"
            >
              Start Chatting
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
