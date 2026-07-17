import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findUserByEmail, createUser, updateUser } from "@/lib/airtable-auth.server";
import { hashPassword, verifyPassword } from "@/lib/password.server";

const BLOCKED_STATUSES = new Set(["Suspended", "Disabled", "Deactivated"]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6).max(200),
        name: z.string().min(1).max(200),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email);
    const existing = await findUserByEmail(email);
    if (existing) throw new Error("An account with this email already exists.");

    const passwordHash = await hashPassword(data.password);
    await createUser({
      Email: email,
      "Password Hash": passwordHash,
      Name: data.name,
      Role: "User",
      "Account Status": "Active",
      "Last Login": new Date().toISOString(),
    });

    return { userId: email, userName: data.name };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(1).max(200),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email);
    const user = await findUserByEmail(email);
    if (!user) throw new Error("No account found with that email.");

    const status = user.fields["Account Status"];
    if (status && BLOCKED_STATUSES.has(status)) {
      throw new Error(`This account is ${status.toLowerCase()}. Contact support for help.`);
    }

    const passwordHash = user.fields["Password Hash"];
    const valid = typeof passwordHash === "string" && (await verifyPassword(data.password, passwordHash));
    if (!valid) throw new Error("Incorrect password.");

    await updateUser(user.id, { "Last Login": new Date().toISOString() });

    return { userId: email, userName: user.fields["Name"] ?? email };
  });
