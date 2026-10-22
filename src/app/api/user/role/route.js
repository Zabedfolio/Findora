import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

/**
 * GET /api/user/role
 * Fetches the user's role directly from the MongoDB database.
 * Supports authentication via Better-Auth session or query parameter (?email=...).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get("email");

    const db = await getDatabase();
    const userCollection = db.collection("user");

    let userDoc = null;

    // 1. If explicit email is provided, query directly
    if (queryEmail) {
      userDoc = await userCollection.findOne({
        email: queryEmail.toLowerCase().trim(),
      });
    }

    // 2. If no explicit email or not found, try reading Better-Auth session
    if (!userDoc) {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (session?.user?.email) {
          userDoc = await userCollection.findOne({
            email: session.user.email.toLowerCase().trim(),
          });
        }
      } catch (err) {
        console.warn("Session retrieval fallback in /api/user/role:", err.message);
      }
    }

    if (!userDoc) {
      // Default fallback
      return NextResponse.json({
        success: true,
        role: "user",
        source: "default",
      });
    }

    const role = userDoc.role || "user";

    return NextResponse.json({
      success: true,
      role,
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        role,
        image: userDoc.image || "",
      },
      source: "database",
    });
  } catch (error) {
    console.error("Error fetching user role from database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user role" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/role
 * Updates a user's role in the MongoDB database.
 * Body: { email, role } or { id, role }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, role, id } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["admin", "moderator", "user"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userCollection = db.collection("user");

    const query = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    } else if (id) {
      query._id = id;
    } else {
      // Attempt to retrieve from session
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (session?.user?.email) {
        query.email = session.user.email.toLowerCase().trim();
      } else {
        return NextResponse.json(
          { success: false, error: "Email or User ID is required" },
          { status: 400 }
        );
      }
    }

    const result = await userCollection.updateOne(
      query,
      {
        $set: {
          role: role.toLowerCase(),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to ${role} in MongoDB`,
      role: role.toLowerCase(),
    });
  } catch (error) {
    console.error("Error updating user role in database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}
