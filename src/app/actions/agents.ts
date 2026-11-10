"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface AgentInput {
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  bio?: string;
}

export async function createAgent(data: AgentInput) {
  try {
    if (!data.name?.trim()) {
      return { error: "Agent name is required." };
    }

    const agent = await db.agent.create({
      data: {
        name: data.name.trim(),
        email: data.email || null,
        phone: data.phone || null,
        photo: data.photo || null,
        bio: data.bio || null,
      },
    });

    revalidatePath("/admin/agents");
    return { success: true, agentId: agent.id };
  } catch (error) {
    console.error("Failed to create agent:", error);
    return { error: "Failed to create agent." };
  }
}

export async function updateAgent(id: string, data: AgentInput) {
  try {
    if (!data.name?.trim()) {
      return { error: "Agent name is required." };
    }

    await db.agent.update({
      where: { id },
      data: {
        name: data.name.trim(),
        email: data.email || null,
        phone: data.phone || null,
        photo: data.photo || null,
        bio: data.bio || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/agents");
    revalidatePath("/admin/properties");
    return { success: true };
  } catch (error) {
    console.error("Failed to update agent:", error);
    return { error: "Failed to update agent." };
  }
}

export async function deleteAgent(id: string) {
  try {
    // onDelete: SetNull on Property.agent — deleting an agent unassigns
    // them from any properties rather than failing or cascading.
    await db.agent.delete({ where: { id } });
    revalidatePath("/admin/agents");
    revalidatePath("/admin/properties");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return { error: "Failed to delete agent." };
  }
}
