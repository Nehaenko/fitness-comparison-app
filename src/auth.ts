import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "@/db";
import {
    accounts,
    profiles,
    sessions,
    users,
    verificationTokens,
} from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [Google],
    session: {
        strategy: "database",
    },
    events: {
        createUser: async ({ user }) => {
            if (!user.id) return;

            await db
                .insert(profiles)
                .values({
                    userId: user.id,
                    displayName: user.name?.trim() || "Forma user",
                })
                .onConflictDoNothing({ target: profiles.userId });
        },
    },
});
