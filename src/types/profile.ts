import { profiles } from "@/db/schema";

export type UserProfile = typeof profiles.$inferSelect;
export type WeightUnit = UserProfile["weightUnit"];
export type MeasurementUnit = UserProfile["measurementUnit"];