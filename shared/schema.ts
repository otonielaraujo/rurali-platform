import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  userType: text("user_type").notNull(), // 'producer' or 'provider'
  createdAt: timestamp("created_at").defaultNow(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceType: text("service_type").notNull(), // 'drone', 'tractor', 'manual'
  specialty: text("specialty").notNull(),
  description: text("description"),
  pricePerHectare: decimal("price_per_hectare", { precision: 10, scale: 2 }),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  coverageRadius: integer("coverage_radius").default(50), // km
  isAvailable: boolean("is_available").default(true),
  certifications: text("certifications").array(),
  equipmentOwned: boolean("equipment_owned").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
});

export const producers = pgTable("producers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  farmName: text("farm_name"),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  farmSize: decimal("farm_size", { precision: 10, scale: 2 }), // hectares
  cropTypes: text("crop_types").array(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  producerId: integer("producer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  serviceType: text("service_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }), // hectares
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  revieweeId: integer("reviewee_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'booking', 'weather', 'payment', 'system'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
});

export const insertProducerSchema = createInsertSchema(producers).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type Producer = typeof producers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type InsertProducer = z.infer<typeof insertProducerSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types for API responses
export type ProviderWithUser = Provider & { user: User };
export type ProducerWithUser = Producer & { user: User };
export type BookingWithDetails = Booking & { 
  provider: ProviderWithUser; 
  producer: ProducerWithUser; 
};
