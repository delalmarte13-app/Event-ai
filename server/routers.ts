import { eq, desc, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, events, media, chatMessages, albums, albumItems, communities, communityMembers, professionals, eventParticipants } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

// Users Router
const usersRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return result[0] ?? null;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      avatarUrl: z.string().url().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});

// Events Router
const eventsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(events).where(eq(events.isPublic, true)).orderBy(desc(events.createdAt)).limit(20);
  }),

  listPublic: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(events).where(eq(events.isPublic, true)).orderBy(desc(events.createdAt)).limit(20);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(events).where(eq(events.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      eventType: z.enum(["wedding", "birthday", "reunion", "concert", "trip", "corporate", "life", "other"]),
      startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
      location: z.string().optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      const inviteCode = nanoid(8).toUpperCase();
      const [result] = await db.insert(events).values({
        organizerId: ctx.user.id,
        title: input.title,
        description: input.description,
        eventType: input.eventType,
        startDate: input.startDate,
        location: input.location,
        isPublic: input.isPublic,
        inviteCode,
        status: "active",
      });

      return { id: (result as any).insertId, inviteCode };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "active", "ended"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      
      await db.update(events).set(updateData).where(and(eq(events.id, input.id), eq(events.organizerId, ctx.user.id)));
      return { success: true };
    }),

  organized: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(events).where(eq(events.organizerId, ctx.user.id)).orderBy(desc(events.createdAt));
  }),

  participated: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const participated = await db.select({ eventId: eventParticipants.eventId }).from(eventParticipants).where(eq(eventParticipants.userId, ctx.user.id));
    if (participated.length === 0) return [];
    const eventIds = participated.map(p => p.eventId);
    return db.select().from(events).where(inArray(events.id, eventIds));
  }),

  joinByCode: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const result = await db.select().from(events).where(eq(events.inviteCode, input.inviteCode)).limit(1);
      const event = result[0];
      if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Evento no encontrado" });
      return { eventId: event.id, title: event.title };
    }),
});

// Media Router
const mediaRouter = router({
  listByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db
        .select({
          id: media.id,
          eventId: media.eventId,
          uploaderId: media.uploaderId,
          url: media.url,
          mimeType: media.mimeType,
          mediaType: media.mediaType,
          isPrivate: media.isPrivate,
          caption: media.caption,
          createdAt: media.createdAt,
          uploaderName: users.name,
          uploaderAvatar: users.avatarUrl,
        })
        .from(media)
        .leftJoin(users, eq(media.uploaderId, users.id))
        .where(and(eq(media.eventId, input.eventId), eq(media.isPrivate, false)))
        .orderBy(desc(media.createdAt));
      return result || [];
    }),

  upload: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      fileName: z.string(),
      mimeType: z.string(),
      base64Data: z.string(),
      caption: z.string().optional(),
      isPrivate: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      try {
        const buffer = Buffer.from(input.base64Data, "base64");
        const suffix = nanoid(8);
        const fileKey = `events/${input.eventId}/media/${ctx.user.id}-${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        const mediaType = input.mimeType.startsWith("video/") ? "video" : "photo";

        const [result] = await db.insert(media).values({
          eventId: input.eventId,
          uploaderId: ctx.user.id,
          fileKey,
          url,
          mimeType: input.mimeType,
          mediaType,
          isPrivate: input.isPrivate,
          caption: input.caption,
        });

        return { id: (result as any).insertId, url };
      } catch (error) {
        console.error("Error uploading media:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al subir el archivo" });
      }
    }),

  togglePrivacy: protectedProcedure
    .input(z.object({ mediaId: z.number(), isPrivate: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      try {
        await db.update(media).set({ isPrivate: input.isPrivate }).where(and(eq(media.id, input.mediaId), eq(media.uploaderId, ctx.user.id)));
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al cambiar privacidad" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ mediaId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      try {
        await db.delete(media).where(and(eq(media.id, input.mediaId), eq(media.uploaderId, ctx.user.id)));
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el archivo" });
      }
    }),

  editWithAI: protectedProcedure
    .input(z.object({ imageUrl: z.string().url(), prompt: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        await invokeLLM({
          messages: [{
            role: "system",
            content: "Eres un experto en edición de fotografía. Responde con instrucciones técnicas claras.",
          }, {
            role: "user",
            content: `¿Cómo editar una foto con: ${input.prompt}? Sé específico.`,
          }],
        });
        return { editedImageUrl: input.imageUrl };
      } catch (error) {
        console.error("Error en editWithAI:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al editar la foto con IA" });
      }
    }),

  generateVideoWithAI: protectedProcedure
    .input(z.object({ eventId: z.number(), mediaUrls: z.array(z.string().url()), prompt: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const aiResponse = await invokeLLM({
          messages: [{
            role: "system",
            content: "Eres un director de cine creativo. Crea narrativas cinematográficas para videos de eventos.",
          }, {
            role: "user",
            content: `Crea una narrativa de video para un evento con ${input.mediaUrls.length} fotos. Contexto: ${input.prompt}. La narrativa debe ser emotiva y cinematográfica.`,
          }],
        });
        const narrativeText = (aiResponse as any).choices?.[0]?.message?.content ?? "Video generado";
        const videoUrl = input.mediaUrls[0] ?? "https://example.com/video.mp4";
        return { videoUrl, narrative: narrativeText };
      } catch (error) {
        console.error("Error en generateVideoWithAI:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al generar el video con IA" });
      }
    }),
});

// Chat Router
const chatRouter = router({
  getMessages: protectedProcedure
    .input(z.object({ eventId: z.number(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const messages = await db
        .select({
          id: chatMessages.id,
          eventId: chatMessages.eventId,
          senderId: chatMessages.senderId,
          content: chatMessages.content,
          messageType: chatMessages.messageType,
          createdAt: chatMessages.createdAt,
          senderName: users.name,
          senderAvatar: users.avatarUrl,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .where(eq(chatMessages.eventId, input.eventId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit);
      return messages.reverse();
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      content: z.string().min(1),
      messageType: z.enum(["text", "image", "system"]).default("text"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const [result] = await db.insert(chatMessages).values({
        eventId: input.eventId,
        senderId: ctx.user.id,
        content: input.content,
        messageType: input.messageType,
      });
      return { id: (result as any).insertId };
    }),
});

// Albums Router
const albumsRouter = router({
  listByEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(albums).where(eq(albums.eventId, input.eventId)).orderBy(desc(albums.createdAt));
    }),

  getWithItems: protectedProcedure
    .input(z.object({ albumId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const albumResult = await db.select().from(albums).where(eq(albums.id, input.albumId)).limit(1);
      const album = albumResult[0];
      if (!album) return null;

      const items = await db
        .select({
          id: albumItems.id,
          order: albumItems.order,
          aiCaption: albumItems.aiCaption,
          mediaId: albumItems.mediaId,
          url: media.url,
          mediaType: media.mediaType,
          caption: media.caption,
        })
        .from(albumItems)
        .leftJoin(media, eq(albumItems.mediaId, media.id))
        .where(eq(albumItems.albumId, input.albumId))
        .orderBy(albumItems.order);

      return { ...album, items };
    }),

  generate: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      title: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      const photos = await db
        .select()
        .from(media)
        .where(and(eq(media.eventId, input.eventId), eq(media.mediaType, "photo"), eq(media.isPrivate, false)))
        .orderBy(media.createdAt)
        .limit(30);

      if (photos.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No hay fotos disponibles para generar el álbum" });
      }

      const [albumResult] = await db.insert(albums).values({
        eventId: input.eventId,
        createdById: ctx.user.id,
        title: input.title,
        coverUrl: photos[0]?.url ?? null,
        status: "generating",
      });
      const albumId = (albumResult as any).insertId as number;

      const eventResult = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
      const event = eventResult[0];

      let aiSummary = "";
      try {
        const aiResponse = await invokeLLM({
          messages: [{
            role: "system",
            content: "Eres un escritor creativo especializado en crear descripciones emotivas y personales de eventos especiales. Escribe en español.",
          }, {
            role: "user",
            content: `Crea una descripción narrativa emotiva y personal para un álbum de fotos del evento "${event?.title ?? input.title}" (tipo: ${event?.eventType ?? "evento"}). El álbum tiene ${photos.length} fotos. Escribe 2-3 párrafos que capturen la esencia del momento. Máximo 300 palabras.`,
          }],
        });
        aiSummary = (aiResponse as any).choices?.[0]?.message?.content ?? "";
      } catch (e) {
        aiSummary = `Álbum de recuerdos del evento "${event?.title ?? input.title}" con ${photos.length} momentos especiales.`;
      }

      const selectedPhotos = photos.slice(0, 20);

      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        await db.insert(albumItems).values({
          albumId,
          mediaId: photo.id,
          order: i,
          aiCaption: photo.caption ?? null,
        });
      }

      await db.update(albums).set({ status: "ready", aiSummary, coverUrl: selectedPhotos[0]?.url ?? null }).where(eq(albums.id, albumId));

      return { albumId, photoCount: selectedPhotos.length };
    }),
});

// Communities Router
const communitiesRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(communities).orderBy(desc(communities.createdAt)).limit(20);
  }),

  join: protectedProcedure
    .input(z.object({ communityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      try {
        await db.insert(communityMembers).values({
          communityId: input.communityId,
          userId: ctx.user.id,
        });
      } catch (e) {
        // Already a member
      }
      return { success: true };
    }),
});

// Professionals Router
const professionalsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(professionals).orderBy(desc(professionals.createdAt)).limit(50);
  }),

  register: protectedProcedure
    .input(z.object({
      businessName: z.string().min(1),
      category: z.enum(["photographer", "videographer", "catering", "florist", "music", "decoration", "venue", "other"]),
      description: z.string().optional(),
      contactPhone: z.string().optional(),
      contactEmail: z.string().email().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const [result] = await db.insert(professionals).values({
        userId: ctx.user.id,
        businessName: input.businessName,
        category: input.category,
        description: input.description,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        website: input.website,
      });
      return { id: (result as any).insertId };
    }),
});

// System Router
const systemRouter = router({
  notifyOwner: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Notification:", input);
      return { success: true };
    }),
});

// Main Router
export const appRouter = router({
  users: usersRouter,
  events: eventsRouter,
  media: mediaRouter,
  chat: chatRouter,
  albums: albumsRouter,
  communities: communitiesRouter,
  professionals: professionalsRouter,
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const COOKIE_NAME = "session";
      const cookieOptions = { maxAge: -1, secure: true, sameSite: "none" as const, httpOnly: true, path: "/" };
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
