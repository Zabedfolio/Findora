import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin } from "better-auth/plugins";
import { generateAndUploadVectorAvatar } from "@/lib/avatarService";

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/findora";
const client = new MongoClient(mongoUri);
const db = client.db(process.env.MONGODB_NAME || "findora");

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "default_findora_secret_for_local_development_32chars",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    advanced: {
        cookiePrefix: "my_app_v2"
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    let image = user.image;
                    if (!image || typeof image !== "string" || image.trim() === "") {
                        try {
                            image = await generateAndUploadVectorAvatar({
                                name: user.name,
                                email: user.email,
                            });
                        } catch (err) {
                            console.warn("Failed to upload vector avatar to ImgBB on user creation:", err.message);
                        }
                    }
                    return {
                        data: {
                            ...user,
                            image: image || "",
                        },
                    };
                },
            },
        },
    },
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin"],
        }),
    ],
    database: mongodbAdapter(db, {
        client,
    }),
});

