import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(env.process.MONGODB_NAME);

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    advanced: {
        cookiePrefix: "my_app_v2"
    },
    emailAndPassword: {
        enabled: true,
    },
    database: mongodbAdapter(db, {
        client,
    }),
});