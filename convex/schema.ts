import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    message: v.string(),
    senderName: v.string(),
    createdAt: v.number(), // timestamp
  })
    .index("by_created_at", ["createdAt"])
    .searchIndex("search_notes", {
      searchField: "message",
      filterFields: ["senderName"],
    }),
  
  carousel_images: defineTable({
    storageId: v.id("_storage"),
    caption: v.string(),
    altText: v.string(),
    uploadedAt: v.number(),
  })
    .index("by_upload_time", ["uploadedAt"]),
});