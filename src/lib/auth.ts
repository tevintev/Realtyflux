import { SignJWT, jwtVerify } from "jose";
import { cookies as getCookies } from "next/headers";

function getKey() {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    // No fallback: a hardcoded default here would let anyone who reads this
    // file forge a valid admin session without knowing the password.
    throw new Error(
      "JWT_SECRET is not set. Set it in .env before signing or verifying admin sessions."
    );
  }
  return new TextEncoder().encode(SECRET_KEY);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getKey());
}

export async function decrypt(input: string) {
  try {
    const { payload } = await jwtVerify(input, getKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await getCookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
