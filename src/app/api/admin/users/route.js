import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { generateAndUploadVectorAvatar } from "@/lib/avatarService";

/**
 * GET /api/admin/users
 * Returns list of users from MongoDB database, enriched with their role and status.
 * If any user has no image, generates a vector avatar, uploads to ImgBB, and sets in MongoDB.
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const userCollection = db.collection("user");

    const users = await userCollection.find({}).toArray();

    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        let userImage = u.image;
        if (!userImage || typeof userImage !== "string" || userImage.trim() === "") {
          try {
            userImage = await generateAndUploadVectorAvatar({
              name: u.name,
              email: u.email,
            });
            if (userImage) {
              await userCollection.updateOne(
                { _id: u._id },
                {
                  $set: {
                    image: userImage,
                    updatedAt: new Date().toISOString(),
                  },
                }
              );
            }
          } catch (err) {
            console.warn("Could not auto-generate ImgBB avatar for user:", u.email, err.message);
          }
        }

        return {
          id: u._id.toString(),
          name: u.name || "User",
          email: u.email,
          phone: u.phone || "+880 1712-000000",
          avatar: userImage || "/default-avatar.png",
          role: u.role || "user",
          status: u.banned ? "suspended" : "active",
          listingsCount: u.listingsCount || 0,
          claimsCount: u.claimsCount || 0,
          joinedDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recent",
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users from database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
