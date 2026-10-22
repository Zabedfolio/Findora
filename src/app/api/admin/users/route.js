import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/admin/users
 * Returns list of users from MongoDB database, enriched with their role and status.
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const userCollection = db.collection("user");

    const users = await userCollection.find({}).toArray();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name || "User",
      email: u.email,
      phone: u.phone || "+880 1712-000000",
      avatar: u.image || "/default-avatar.png",
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
    }));

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
