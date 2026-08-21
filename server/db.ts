import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { connect } from "@tidbcloud/serverless";
import {
  generatedLetters,
  type GeneratedLetter,
  type InsertUser,
  savedProcedures,
  userTasks,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

type DrizzleDb = ReturnType<typeof drizzle>;
let _db: any = null;

export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.error("[Database] FATAL: DATABASE_URL is not defined!");
      return null;
    }

    try {
      console.log("[Database] Connecting via TiDB HTTP Driver (Serverless optimized)...");
      
      const client = connect({
        url: process.env.DATABASE_URL,
      });

      // Use drizzle with the HTTP client as a proxy
      _db = drizzle(client as any);
      
      console.log("[Database] TiDB HTTP Client initialized.");
    } catch (error) {
      console.error("[Database] FATAL CONNECTION ERROR:", error instanceof Error ? error.message : String(error));
      return null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: any = { openId: user.openId };
    const updateSet: Record<string, any> = {};

    const textFields = ["name", "email", "loginMethod", "country"] as const;
    
    textFields.forEach((field) => {
      const value = (user as any)[field];
      if (value !== undefined) {
        values[field] = value ?? null;
        updateSet[field] = value ?? null;
      }
    });

    if (user.ageGroup !== undefined) {
      const validAgeGroups = ["junior", "teen", "adult", "senior"] as const;
      const ag =
        user.ageGroup && validAgeGroups.includes(user.ageGroup as any)
          ? (user.ageGroup as any)
          : null;
      values.ageGroup = ag;
      updateSet.ageGroup = ag;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// --- Saved procedures ---

export async function listSavedProcedures(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedProcedures).where(eq(savedProcedures.userId, userId));
}

export async function saveProcedure(userId: number, procedureKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(savedProcedures)
    .where(
      and(eq(savedProcedures.userId, userId), eq(savedProcedures.procedureKey, procedureKey))
    )
    .limit(1);
  if (existing.length > 0) return existing[0];
  const [result] = await db
    .insert(savedProcedures)
    .values({ userId, procedureKey, completedSteps: [] });
  return { id: result.insertId, userId, procedureKey, completedSteps: [], createdAt: new Date(), updatedAt: new Date() };
}

export async function markProcedureSteps(
  userId: number,
  procedureKey: string,
  completedSteps: number[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(savedProcedures)
    .set({ completedSteps })
    .where(
      and(eq(savedProcedures.userId, userId), eq(savedProcedures.procedureKey, procedureKey))
    );
  return { success: true };
}

// --- User tasks ---

export async function listTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userTasks).where(eq(userTasks.userId, userId)).orderBy(desc(userTasks.createdAt));
}

export async function createTask(userId: number, input: { title: string; description?: string; deadlineAt?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(userTasks).values({ userId, ...input });
  return { id: result.insertId, userId, status: "todo" as const, createdAt: new Date(), updatedAt: new Date(), ...input };
}

export async function updateTaskStatus(
  userId: number,
  taskId: number,
  status: "todo" | "in_progress" | "done"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(userTasks)
    .set({ status })
    .where(and(eq(userTasks.userId, userId), eq(userTasks.id, taskId)));
  return { success: true };
}

export async function deleteTask(userId: number, taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(userTasks)
    .where(and(eq(userTasks.userId, userId), eq(userTasks.id, taskId)));
  return { success: true };
}

// --- Generated letters ---

export async function listLetters(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generatedLetters).where(eq(generatedLetters.userId, userId)).orderBy(desc(generatedLetters.createdAt));
}

export async function createLetter(
  userId: number,
  input: {
    letterType: GeneratedLetter["letterType"];
    title?: string;
    content: string;
    formData?: unknown;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(generatedLetters).values({
    userId,
    ...input,
  });
  return { id: result.insertId, userId, createdAt: new Date(), ...input };
}

// --- User profile ---

export async function updateUserProfile(
  userId: number,
  input: { name?: string; ageGroup?: "junior" | "teen" | "adult" | "senior"; country?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, any> = {};
  if (input.name !== undefined) updateSet.name = input.name;
  if (input.ageGroup !== undefined) updateSet.ageGroup = input.ageGroup;
  if (input.country !== undefined) updateSet.country = input.country;
  await db.update(users).set(updateSet).where(eq(users.id, userId));
  return { success: true };
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
