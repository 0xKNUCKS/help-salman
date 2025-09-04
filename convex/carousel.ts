import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to add a carousel image with storage ID
export const addCarouselImage = mutation({
  args: {
    storageId: v.id("_storage"),
    caption: v.string(),
    altText: v.string(),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("carousel_images", {
      storageId: args.storageId,
      caption: args.caption,
      altText: args.altText,
      uploadedAt: Date.now(),
    });
    
    return imageId;
  },
});

// Query to get all carousel images with URLs
export const getCarouselImages = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query("carousel_images")
      .withIndex("by_upload_time")
      .order("asc") // Show in upload order
      .collect();
    
    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => ({
        id: image._id,
        storageId: image.storageId,
        url: await ctx.storage.getUrl(image.storageId),
        caption: image.caption,
        altText: image.altText,
        uploadedAt: image.uploadedAt,
      }))
    );
    
    return imagesWithUrls;
  },
});

// Mutation to update carousel image
export const updateCarouselImage = mutation({
  args: {
    id: v.id("carousel_images"),
    caption: v.optional(v.string()),
    altText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.caption !== undefined) updates.caption = args.caption;
    if (args.altText !== undefined) updates.altText = args.altText;
    
    await ctx.db.patch(args.id, updates);
    return { success: true };
  },
});

// Mutation to delete carousel image
export const deleteCarouselImage = mutation({
  args: {
    id: v.id("carousel_images"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Query to get file URL for a storage ID
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Query to get carousel image with URL
export const getCarouselImageWithUrl = query({
  args: {
    storageId: v.id("_storage"),
    caption: v.string(),
    altText: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return {
      url,
      caption: args.caption,
      altText: args.altText,
      storageId: args.storageId,
    };
  },
});