"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface SubmitMessageData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  propertyId?: string;
}

export async function submitMessage(data: SubmitMessageData) {
  try {
    await db.message.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        propertyId: data.propertyId || null,
      },
    });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to save message:", error);
    return { error: "Failed to send message. Please try again." };
  }
}

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
