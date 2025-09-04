import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to create a new note
export const createNote = mutation({
  args: {
    message: v.string(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    // Enhanced validation
    const message = args.message.trim();
    const senderName = args.senderName.trim();
    
    if (!message || !senderName) {
      throw new Error("Message and sender name are required");
    }
    
    // Length validation
    if (message.length > 500) {
      throw new Error("Message too long (max 500 characters)");
    }
    
    if (senderName.length > 50) {
      throw new Error("Sender name too long (max 50 characters)");
    }
    
    // Character validation - only allow safe characters
    const safePattern = /^[\w\s.,!?'"-]*$/;
    const namePattern = /^[\w\s'-]*$/;
    
    if (!safePattern.test(message)) {
      throw new Error("Message contains invalid characters");
    }
    
    if (!namePattern.test(senderName)) {
      throw new Error("Sender name contains invalid characters");
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /<iframe/i,
      /eval\s*\(/i
    ];
    
    const combinedInput = message + ' ' + senderName;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedInput)) {
        throw new Error("Input contains potentially harmful content");
      }
    }
    
    const noteId = await ctx.db.insert("notes", {
      message,
      senderName,
      createdAt: Date.now(),
    });
    
    return noteId;
  },
});

// Query to get recent notes (for homepage)
export const getRecentNotes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;
    
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);
    
    return notes.map(note => ({
      id: note._id,
      message: note.message,
      senderName: note.senderName,
      createdAt: note.createdAt,
    }));
  },
});

// Query to get all notes (for messages page)
export const getAllNotes = query({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    
    return notes.map(note => ({
      id: note._id,
      message: note.message,
      senderName: note.senderName,
      createdAt: note.createdAt,
    }));
  },
});

// Query to get notes count
export const getNotesCount = query({
  args: {},
  handler: async (ctx) => {
    const count = await ctx.db.query("notes").collect();
    return count.length;
  },
});

// Mutation to delete a note (admin functionality)
export const deleteNote = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});