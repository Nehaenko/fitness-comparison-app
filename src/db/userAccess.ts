import "server-only";

import {count, eq} from "drizzle-orm";

import {db} from "@/db";
import {users} from "@/db/schema";

const DEFAULT_ACCOUNT_LIMIT = 10;

function getAccountLimit() {
    const configuredLimit = Number.parseInt(
        process.env.AUTH_ACCOUNT_LIMIT ?? "",
        10,
    );

    return Number.isSafeInteger(configuredLimit) && configuredLimit > 0
        ? configuredLimit
        : DEFAULT_ACCOUNT_LIMIT;
}

export async function canSignInWithEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const [existingUser] = await db
        .select({id: users.id})
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

    if (existingUser) {
        return true;
    }

    const [result] = await db
        .select({accountCount: count(users.id)})
        .from(users);

    return (result?.accountCount ?? 0) < getAccountLimit();
}
