import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const blockedSitesTable = pgTable("blocked_sites", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  category: text("category").notNull().default("Custom"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlockedSiteSchema = createInsertSchema(blockedSitesTable).omit({ id: true, createdAt: true });
export type InsertBlockedSite = z.infer<typeof insertBlockedSiteSchema>;
export type BlockedSite = typeof blockedSitesTable.$inferSelect;
