import { 
  users, providers, producers, bookings, reviews, notifications,
  type User, type Provider, type Producer, type Booking, type Review, type Notification,
  type InsertUser, type InsertProvider, type InsertProducer, type InsertBooking, 
  type InsertReview, type InsertNotification,
  type ProviderWithUser, type ProducerWithUser, type BookingWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Providers
  getProvider(id: number): Promise<Provider | undefined>;
  getProviderByUserId(userId: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, updates: Partial<Provider>): Promise<Provider | undefined>;
  searchProviders(filters: {
    serviceType?: string;
    location?: string;
    maxDistance?: number;
    latitude?: number;
    longitude?: number;
    isAvailable?: boolean;
  }): Promise<ProviderWithUser[]>;
  getProvidersNearby(latitude: number, longitude: number, radiusKm: number): Promise<ProviderWithUser[]>;

  // Producers
  getProducer(id: number): Promise<Producer | undefined>;
  getProducerByUserId(userId: number): Promise<Producer | undefined>;
  createProducer(producer: InsertProducer): Promise<Producer>;
  updateProducer(id: number, updates: Partial<Producer>): Promise<Producer | undefined>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined>;
  getBookingsByProducer(producerId: number): Promise<BookingWithDetails[]>;
  getBookingsByProvider(providerId: number): Promise<BookingWithDetails[]>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProvider(providerId: number): Promise<Review[]>;
  getReviewsByReviewer(reviewerId: number): Promise<Review[]>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private providers: Map<number, Provider>;
  private producers: Map<number, Producer>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private notifications: Map<number, Notification>;
  private currentUserId: number;
  private currentProviderId: number;
  private currentProducerId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.providers = new Map();
    this.producers = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.currentUserId = 1;
    this.currentProviderId = 1;
    this.currentProducerId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentNotificationId = 1;

    // Add some initial data for development
    this.seedData();
  }

  private seedData() {
    // Create demo users
    const demoUsers = [
      {
        username: "carlos.santos",
        email: "carlos@example.com",
        password: "password123",
        name: "Carlos Santos",
        phone: "(11) 99999-1111",
        userType: "provider"
      },
      {
        username: "ana.oliveira",
        email: "ana@example.com",
        password: "password123",
        name: "Ana Oliveira",
        phone: "(11) 99999-2222",
        userType: "provider"
      },
      {
        username: "joao.silva",
        email: "joao@example.com",
        password: "password123",
        name: "João Silva",
        phone: "(11) 99999-3333",
        userType: "producer"
      }
    ];

    demoUsers.forEach(user => {
      const id = this.currentUserId++;
      this.users.set(id, { ...user, id, createdAt: new Date() });
    });

    // Create demo providers
    const demoProviders = [
      {
        userId: 1,
        serviceType: "drone",
        specialty: "Pulverização Agrícola",
        description: "Operador de drone especializado em pulverização com certificação ANAC",
        pricePerHectare: "35.00",
        location: "São Paulo, SP",
        latitude: "-23.5505",
        longitude: "-46.6333",
        coverageRadius: 50,
        isAvailable: true,
        certifications: ["ANAC", "Fitossanitário"],
        equipmentOwned: true,
        rating: "4.9",
        totalReviews: 127
      },
      {
        userId: 2,
        serviceType: "drone",
        specialty: "Pulverização Orgânica",
        description: "Especialista em produtos orgânicos e sustentabilidade",
        pricePerHectare: "32.00",
        location: "Campinas, SP",
        latitude: "-22.9056",
        longitude: "-47.0608",
        coverageRadius: 40,
        isAvailable: true,
        certifications: ["ANAC", "Orgânicos"],
        equipmentOwned: true,
        rating: "4.8",
        totalReviews: 89
      }
    ];

    demoProviders.forEach(provider => {
      const id = this.currentProviderId++;
      this.providers.set(id, { 
        ...provider, 
        id,
        pricePerDay: null,
        description: provider.description || null
      });
    });

    // Create demo producer
    const demoProducer = {
      userId: 3,
      farmName: "Fazenda Santa Maria",
      location: "Ribeirão Preto, SP",
      latitude: "-21.1775",
      longitude: "-47.8100",
      farmSize: "150.00",
      cropTypes: ["soja", "milho", "cana"]
    };

    this.producers.set(1, { ...demoProducer, id: 1 });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      phone: insertUser.phone || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Providers
  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByUserId(userId: number): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(provider => provider.userId === userId);
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderId++;
    const provider: Provider = { 
      ...insertProvider, 
      id,
      description: insertProvider.description || null,
      latitude: insertProvider.latitude || null,
      longitude: insertProvider.longitude || null,
      pricePerHectare: insertProvider.pricePerHectare || null,
      pricePerDay: insertProvider.pricePerDay || null,
      certifications: insertProvider.certifications || null,
      coverageRadius: insertProvider.coverageRadius || 50,
      isAvailable: insertProvider.isAvailable !== false,
      equipmentOwned: insertProvider.equipmentOwned !== false,
      rating: insertProvider.rating || "0",
      totalReviews: insertProvider.totalReviews || 0
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: number, updates: Partial<Provider>): Promise<Provider | undefined> {
    const provider = this.providers.get(id);
    if (!provider) return undefined;
    const updatedProvider = { ...provider, ...updates };
    this.providers.set(id, updatedProvider);
    return updatedProvider;
  }

  async searchProviders(filters: {
    serviceType?: string;
    location?: string;
    maxDistance?: number;
    latitude?: number;
    longitude?: number;
    isAvailable?: boolean;
  }): Promise<ProviderWithUser[]> {
    let results = Array.from(this.providers.values());

    if (filters.serviceType) {
      results = results.filter(p => p.serviceType === filters.serviceType);
    }

    if (filters.isAvailable !== undefined) {
      results = results.filter(p => p.isAvailable === filters.isAvailable);
    }

    if (filters.location) {
      results = results.filter(p => 
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.latitude && filters.longitude && filters.maxDistance) {
      results = results.filter(p => {
        if (!p.latitude || !p.longitude) return false;
        const distance = this.calculateDistance(
          parseFloat(filters.latitude!.toString()),
          parseFloat(filters.longitude!.toString()),
          parseFloat(p.latitude),
          parseFloat(p.longitude)
        );
        return distance <= filters.maxDistance!;
      });
    }

    // Add user information
    return results.map(provider => {
      const user = this.users.get(provider.userId)!;
      return { ...provider, user };
    });
  }

  async getProvidersNearby(latitude: number, longitude: number, radiusKm: number): Promise<ProviderWithUser[]> {
    return this.searchProviders({
      latitude,
      longitude,
      maxDistance: radiusKm,
      isAvailable: true
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Producers
  async getProducer(id: number): Promise<Producer | undefined> {
    return this.producers.get(id);
  }

  async getProducerByUserId(userId: number): Promise<Producer | undefined> {
    return Array.from(this.producers.values()).find(producer => producer.userId === userId);
  }

  async createProducer(insertProducer: InsertProducer): Promise<Producer> {
    const id = this.currentProducerId++;
    const producer: Producer = { 
      ...insertProducer, 
      id,
      farmName: insertProducer.farmName || null,
      latitude: insertProducer.latitude || null,
      longitude: insertProducer.longitude || null,
      farmSize: insertProducer.farmSize || null,
      cropTypes: insertProducer.cropTypes || null
    };
    this.producers.set(id, producer);
    return producer;
  }

  async updateProducer(id: number, updates: Partial<Producer>): Promise<Producer | undefined> {
    const producer = this.producers.get(id);
    if (!producer) return undefined;
    const updatedProducer = { ...producer, ...updates };
    this.producers.set(id, updatedProducer);
    return updatedProducer;
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      area: insertBooking.area || null,
      totalPrice: insertBooking.totalPrice || null,
      notes: insertBooking.notes || null,
      status: insertBooking.status || "pending"
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getBookingsByProducer(producerId: number): Promise<BookingWithDetails[]> {
    const bookings = Array.from(this.bookings.values())
      .filter(booking => booking.producerId === producerId);

    return bookings.map(booking => {
      const provider = this.providers.get(booking.providerId)!;
      const providerUser = this.users.get(provider.userId)!;
      const producer = this.producers.get(booking.producerId)!;
      const producerUser = this.users.get(producer.userId)!;

      return {
        ...booking,
        provider: { ...provider, user: providerUser },
        producer: { ...producer, user: producerUser }
      };
    });
  }

  async getBookingsByProvider(providerId: number): Promise<BookingWithDetails[]> {
    const bookings = Array.from(this.bookings.values())
      .filter(booking => booking.providerId === providerId);

    return bookings.map(booking => {
      const provider = this.providers.get(booking.providerId)!;
      const providerUser = this.users.get(provider.userId)!;
      const producer = this.producers.get(booking.producerId)!;
      const producerUser = this.users.get(producer.userId)!;

      return {
        ...booking,
        provider: { ...provider, user: providerUser },
        producer: { ...producer, user: producerUser }
      };
    });
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: new Date(),
      comment: insertReview.comment || null
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.revieweeId === providerId);
  }

  async getReviewsByReviewer(reviewerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.reviewerId === reviewerId);
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date(),
      isRead: insertNotification.isRead || null
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Providers
  async getProvider(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviderByUserId(userId: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db
      .insert(providers)
      .values(insertProvider)
      .returning();
    return provider;
  }

  async updateProvider(id: number, updates: Partial<Provider>): Promise<Provider | undefined> {
    const [provider] = await db
      .update(providers)
      .set(updates)
      .where(eq(providers.id, id))
      .returning();
    return provider || undefined;
  }

  async searchProviders(filters: {
    serviceType?: string;
    location?: string;
    maxDistance?: number;
    latitude?: number;
    longitude?: number;
    isAvailable?: boolean;
  }): Promise<ProviderWithUser[]> {
    const conditions = [];
    
    if (filters.serviceType) {
      conditions.push(eq(providers.serviceType, filters.serviceType));
    }
    
    if (filters.isAvailable !== undefined) {
      conditions.push(eq(providers.isAvailable, filters.isAvailable));
    }

    if (filters.location) {
      conditions.push(sql`${providers.location} ILIKE ${`%${filters.location}%`}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await db
      .select()
      .from(providers)
      .leftJoin(users, eq(providers.userId, users.id))
      .where(whereClause);

    return results
      .filter(result => result.users) // Ensure user exists
      .map(result => ({
        ...result.providers,
        user: result.users!
      }));
  }

  async getProvidersNearby(latitude: number, longitude: number, radiusKm: number): Promise<ProviderWithUser[]> {
    return this.searchProviders({
      latitude,
      longitude,
      maxDistance: radiusKm,
      isAvailable: true
    });
  }

  // Producers
  async getProducer(id: number): Promise<Producer | undefined> {
    const [producer] = await db.select().from(producers).where(eq(producers.id, id));
    return producer || undefined;
  }

  async getProducerByUserId(userId: number): Promise<Producer | undefined> {
    const [producer] = await db.select().from(producers).where(eq(producers.userId, userId));
    return producer || undefined;
  }

  async createProducer(insertProducer: InsertProducer): Promise<Producer> {
    const [producer] = await db
      .insert(producers)
      .values(insertProducer)
      .returning();
    return producer;
  }

  async updateProducer(id: number, updates: Partial<Producer>): Promise<Producer | undefined> {
    const [producer] = await db
      .update(producers)
      .set(updates)
      .where(eq(producers.id, id))
      .returning();
    return producer || undefined;
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async getBookingsByProducer(producerId: number): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(providers, eq(bookings.providerId, providers.id))
      .leftJoin(users, eq(providers.userId, users.id))
      .leftJoin(producers, eq(bookings.producerId, producers.id))
      .where(eq(bookings.producerId, producerId));

    return results.map(result => ({
      ...result.bookings,
      provider: {
        ...result.providers!,
        user: result.users!
      },
      producer: {
        ...result.producers!,
        user: result.users!
      }
    }));
  }

  async getBookingsByProvider(providerId: number): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(providers, eq(bookings.providerId, providers.id))
      .leftJoin(users, eq(providers.userId, users.id))
      .leftJoin(producers, eq(bookings.producerId, producers.id))
      .where(eq(bookings.providerId, providerId));

    return results.map(result => ({
      ...result.bookings,
      provider: {
        ...result.providers!,
        user: result.users!
      },
      producer: {
        ...result.producers!,
        user: result.users!
      }
    }));
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReviewsByProvider(providerId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, providerId));
  }

  async getReviewsByReviewer(reviewerId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewerId, reviewerId));
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`);
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }
}

export const storage = new DatabaseStorage();
