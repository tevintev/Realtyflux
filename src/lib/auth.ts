import { SignJWT, jwtVerify } from "jose";
import { cookies as getCookies } from "next/headers";

function getKey() {
  const SECRET_KEY = process.env.JWT_SECRET || "realty_flux_admin_secret_key_change_me_in_production";
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
