// client/src/lib/auth-client.js
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    plugins: [
        inferAdditionalFields({
            user: {
                role: { type: "string" },
                isBlocked: { type: "boolean" },
                phone: { type: "string" },
                dateOfBirth: { type: "string" },
                image: { type: "string" },
            },
        }),
    ],
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;

export async function getCurrentUser() {
    try {
        const { data: session } = await getSession();
        return session?.user || null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}