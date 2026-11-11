import { getSession } from "@/lib/auth";

export const NOT_ADMIN_ERROR = "Please sign in as an admin to do this.";

// Server actions are public HTTP endpoints: the admin middleware only guards
// the /admin pages, not a direct call to an action. Every admin-only action
// starts with this check so it stays protected even if a public page ever
// imports it. Each action returns its own { error } object (not a shared one)
// so the admin screens keep reading `res.error` with the right types:
//
//   if (!(await isAdmin())) return { error: NOT_ADMIN_ERROR };
export async function isAdmin(): Promise<boolean> {
  return Boolean(await getSession());
}
