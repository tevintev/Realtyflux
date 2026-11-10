"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";

// NOTE: `login` deliberately does NOT call cookies().set() itself. Setting a
// cookie inside a Server Action that's invoked directly from a client event
// handler (as opposed to <form action={fn}>) is the same class of edge case
// documented for redirect() in this fork — the response never finished
// streaming back to the browser when it was tried here, leaving the button
// spinning forever even though the server had already completed successfully
// (confirmed via server-side logging). Session establishment is handled by a
// plain Route Handler instead: see src/app/api/admin/session/route.ts.

function recoveryCodeMatches(submitted: string, expected: string) {
  // Hash both to a fixed length first so timingSafeEqual never throws on a
  // length mismatch (which would itself leak the correct code's length).
  const a = createHash("sha256").update(submitted).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  try {
    const admin = await db.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return { error: "Invalid username or password." };
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return { error: "Invalid username or password." };
    }

    // Issue a signed session token; the client exchanges this for a cookie
    // via POST /api/admin/session (see note above for why).
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({
      userId: admin.id,
      username: admin.username,
      name: admin.name,
      expires,
    });

    return { success: true, token: session };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPasswordWithRecoveryCode(
  prevState: any,
  formData: FormData
) {
  const username = ((formData.get("username") as string) || "admin").trim();
  const recoveryCode = (formData.get("recoveryCode") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const expectedCode = process.env.ADMIN_RECOVERY_CODE;
  if (!expectedCode) {
    return {
      error:
        "No recovery code is configured on this server. Set ADMIN_RECOVERY_CODE in .env to enable this.",
    };
  }

  if (!recoveryCode || !recoveryCodeMatches(recoveryCode, expectedCode)) {
    return { error: "Invalid recovery code." };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) {
      return { error: `No admin user found with username "${username}".` };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.adminUser.update({
      where: { username },
      data: { password: hashed },
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
