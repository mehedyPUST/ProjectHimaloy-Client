// client/src/lib/auth.js
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB);

export const auth = betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile) => ({
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: "member",
                isManager: false,
            }),
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "member",
                required: true,
                input: true,
                enum: ["member", "manager", "admin"],
            },
            isBlocked: {
                type: "boolean",
                defaultValue: false,
                required: true,
                input: false,
            },
            isManager: {
                type: "boolean",
                defaultValue: false,
                required: false,
                input: false,
            },
            phone: {
                type: "string",
                required: false,
                input: true,
            },
            dateOfBirth: {
                type: "string",
                required: false,
                input: true,
            },
            image: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },
    advanced: {
        cookiePrefix: 'projecthimaloy',
    },
});

console.log('✅ ProjectHimaloy Auth initialized');
