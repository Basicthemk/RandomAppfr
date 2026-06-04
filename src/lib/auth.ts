import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

export async function getOrCreateUser(clerkId: string, email: string, name?: string) {
  let user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId,
        email,
        name: name || email.split("@")[0],
      },
    });
  }

  return user;
}
