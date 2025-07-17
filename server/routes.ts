import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProviderSchema, insertProducerSchema, 
  insertBookingSchema, insertReviewSchema, insertNotificationSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Create producer or provider profile based on userType
      if (userData.userType === "producer") {
        const producerData = {
          userId: user.id,
          location: req.body.location || "",
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null,
          farmName: req.body.farmName || null,
          farmSize: req.body.farmSize || null,
          cropTypes: req.body.cropTypes || []
        };
        await storage.createProducer(producerData);
      } else if (userData.userType === "provider") {
        const providerData = {
          userId: user.id,
          serviceType: req.body.serviceType || "drone",
          specialty: req.body.specialty || "",
          description: req.body.description || "",
          location: req.body.location || "",
          latitude: req.body.latitude || null,
          longitude: req.body.longitude || null,
          pricePerHectare: req.body.pricePerHectare || null,
          pricePerDay: req.body.pricePerDay || null,
          coverageRadius: req.body.coverageRadius || 50,
          certifications: req.body.certifications || [],
          equipmentOwned: req.body.equipmentOwned !== false
        };
        await storage.createProvider(providerData);
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get additional profile data
      let profile = null;
      if (user.userType === "producer") {
        profile = await storage.getProducerByUserId(user.id);
      } else if (user.userType === "provider") {
        profile = await storage.getProviderByUserId(user.id);
      }

      res.json({ 
        user: { ...user, password: undefined },
        profile
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Provider routes
  app.get("/api/providers/search", async (req, res) => {
    try {
      const filters = {
        serviceType: req.query.serviceType as string,
        location: req.query.location as string,
        maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance as string) : undefined,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        isAvailable: req.query.isAvailable === "true"
      };

      const providers = await storage.searchProviders(filters);
      res.json(providers);
    } catch (error) {
      console.error("Provider search error:", error);
      res.status(500).json({ message: "Error searching providers" });
    }
  });

  app.get("/api/providers/nearby", async (req, res) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseInt(req.query.radius as string) || 50;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Valid latitude and longitude required" });
      }

      const providers = await storage.getProvidersNearby(latitude, longitude, radius);
      res.json(providers);
    } catch (error) {
      console.error("Nearby providers error:", error);
      res.status(500).json({ message: "Error finding nearby providers" });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      const user = await storage.getUser(provider.userId);
      const reviews = await storage.getReviewsByProvider(id);
      
      res.json({ 
        ...provider, 
        user,
        reviews 
      });
    } catch (error) {
      console.error("Get provider error:", error);
      res.status(500).json({ message: "Error getting provider" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      // Create notification for provider
      await storage.createNotification({
        userId: bookingData.providerId,
        title: "Nova Solicitação de Serviço",
        message: "Você recebeu uma nova solicitação de agendamento",
        type: "booking"
      });

      res.json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/producer/:producerId", async (req, res) => {
    try {
      const producerId = parseInt(req.params.producerId);
      const bookings = await storage.getBookingsByProducer(producerId);
      res.json(bookings);
    } catch (error) {
      console.error("Get producer bookings error:", error);
      res.status(500).json({ message: "Error getting bookings" });
    }
  });

  app.get("/api/bookings/provider/:providerId", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const bookings = await storage.getBookingsByProvider(providerId);
      res.json(bookings);
    } catch (error) {
      console.error("Get provider bookings error:", error);
      res.status(500).json({ message: "Error getting bookings" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const booking = await storage.updateBooking(id, updates);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ message: "Error updating booking" });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      
      // Update provider rating
      const reviews = await storage.getReviewsByProvider(reviewData.revieweeId);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await storage.updateProvider(reviewData.revieweeId, {
        rating: avgRating.toFixed(2),
        totalReviews: reviews.length
      });

      res.json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error getting notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Error updating notification" });
    }
  });

  // Weather data endpoint (mock for now)
  app.get("/api/weather", async (req, res) => {
    try {
      // In a real app, this would integrate with a weather API
      const weatherData = {
        condition: "Ideal",
        temperature: 24,
        humidity: 65,
        windSpeed: 8,
        suitableForSpraying: true,
        forecast: [
          { date: "2025-07-18", condition: "Sunny", suitable: true },
          { date: "2025-07-19", condition: "Partly Cloudy", suitable: true },
          { date: "2025-07-20", condition: "Rain", suitable: false }
        ]
      };

      res.json(weatherData);
    } catch (error) {
      console.error("Weather data error:", error);
      res.status(500).json({ message: "Error getting weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
