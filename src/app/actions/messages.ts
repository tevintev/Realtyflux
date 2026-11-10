"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleMessageReadStatus(messageId: string, isRead: boolean) {
  try {
    await db.message.update({
      where: { id: messageId },
      data: { isRead, updatedAt: new Date() },
    });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update message status:", error);
    return { error: "Failed to update message status." };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    await db.message.delete({
      where: { id: messageId },
    });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { error: "Failed to delete message." };
  }
}
