import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertMessageSchema, restaurantInfoSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY || "default_key";
const BODEGOES_PLACE_ID = process.env.BODEGOES_PLACE_ID || "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Default to a sample place ID

const BODEGOES_KNOWLEDGE = `
You are an AI assistant for Bodegoes, a Mediterranean restaurant. Here's what you need to know about Bodegoes:

RESTAURANT OVERVIEW:
- Name: Bodegoes
- Cuisine: Mediterranean
- Specialties: Fresh seafood, grilled meats, vegetarian options, authentic Mediterranean flavors
- Atmosphere: Casual yet elegant, perfect for families, dates, and business meals

MENU HIGHLIGHTS:
- Appetizers: Hummus platter, grilled octopus, Mediterranean bruschetta, stuffed grape leaves
- Main Courses: Grilled branzino, lamb souvlaki, moussaka, seafood paella, Mediterranean chicken
- Vegetarian: Grilled vegetable platter, falafel plate, Mediterranean pasta
- Desserts: Baklava, tiramisu, Greek yogurt with honey and nuts
- Beverages: Extensive wine list featuring Mediterranean wines, craft cocktails, fresh juices

SERVICES:
- Dine-in, takeout, delivery available
- Reservations recommended for dinner
- Private dining rooms available for events
- Catering services for parties and corporate events

SPECIAL FEATURES:
- Happy Hour: 3-6 PM daily with 25% off appetizers and drinks
- Live music on weekends
- Outdoor seating available (weather permitting)
- Gluten-free and vegan options available
- Fresh ingredients sourced locally when possible

Always provide helpful, accurate information about the restaurant. If asked about reservations, direct customers to call the restaurant or use the online booking system. Be friendly, knowledgeable, and enthusiastic about the Mediterranean cuisine and dining experience at Bodegoes.
`;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create chat session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error: error.message });
    }
  });

  // Get chat session messages
  app.get("/api/chat/session/:id/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages", error: error.message });
    }
  });

  // Send message and get AI response
  app.post("/api/chat/message", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createMessage(validatedData);
      
      // Get AI response
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: BODEGOES_KNOWLEDGE
          },
          {
            role: "user",
            content: validatedData.content
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponseContent = response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time. Please try again.";
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        sessionId: validatedData.sessionId,
        content: aiResponseContent,
        isAI: true,
      });

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      console.error("Error in chat message:", error);
      res.status(500).json({ message: "Failed to process message", error: error.message });
    }
  });

  // Get restaurant info from Google Places API
  app.get("/api/restaurant/info", async (req, res) => {
    try {
      // Fetch place details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${BODEGOES_PLACE_ID}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,current_opening_hours&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const place = data.result;
      
      // Transform Google Places data to our schema
      const restaurantInfo = {
        name: place.name || "Bodegoes",
        address: place.formatted_address || "123 Mediterranean St, Downtown",
        phone: place.formatted_phone_number || "(123) 456-7890",
        website: place.website || "bodegoes.com",
        rating: place.rating || 4.5,
        reviews: place.user_ratings_total || 324,
        hours: place.opening_hours ? 
          place.opening_hours.weekday_text.reduce((acc, day) => {
            const [dayName, hours] = day.split(': ');
            acc[dayName] = hours;
            return acc;
          }, {}) : 
          {
            "Monday": "11:00 AM - 10:00 PM",
            "Tuesday": "11:00 AM - 10:00 PM", 
            "Wednesday": "11:00 AM - 10:00 PM",
            "Thursday": "11:00 AM - 11:00 PM",
            "Friday": "11:00 AM - 11:00 PM",
            "Saturday": "12:00 PM - 11:00 PM",
            "Sunday": "12:00 PM - 9:00 PM"
          },
        isOpen: place.current_opening_hours ? place.current_opening_hours.open_now : true,
        currentStatus: place.current_opening_hours ? 
          (place.current_opening_hours.open_now ? "Open" : "Closed") : 
          "Open"
      };

      const validatedInfo = restaurantInfoSchema.parse(restaurantInfo);
      res.json(validatedInfo);
    } catch (error) {
      console.error("Error fetching restaurant info:", error);
      
      // Fallback data if API fails
      const fallbackInfo = {
        name: "Bodegoes",
        address: "123 Mediterranean St, Downtown",
        phone: "(123) 456-7890",
        website: "bodegoes.com",
        rating: 4.5,
        reviews: 324,
        hours: {
          "Monday": "11:00 AM - 10:00 PM",
          "Tuesday": "11:00 AM - 10:00 PM", 
          "Wednesday": "11:00 AM - 10:00 PM",
          "Thursday": "11:00 AM - 11:00 PM",
          "Friday": "11:00 AM - 11:00 PM",
          "Saturday": "12:00 PM - 11:00 PM",
          "Sunday": "12:00 PM - 9:00 PM"
        },
        isOpen: true,
        currentStatus: "Open"
      };
      
      res.json(fallbackInfo);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
