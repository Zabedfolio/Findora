import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

/**
 * GET /api/user/profile
 * Retrieves user profile directly from MongoDB Atlas 'user' collection.
 * Supports authentication via query param (?email=... or ?id=...) or Better-Auth session.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get("email");
    const queryId = searchParams.get("id");

    const db = await getDatabase();
    const userCollection = db.collection("user");

    let userDoc = null;

    if (queryEmail) {
      userDoc = await userCollection.findOne({
        email: queryEmail.toLowerCase().trim(),
      });
    }

    if (!userDoc && queryId) {
      userDoc = await userCollection.findOne({
        $or: [{ _id: queryId }, { id: queryId }],
      });
    }

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
        console.warn("Session check in /api/user/profile GET:", err.message);
      }
    }

    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc._id?.toString() || userDoc.id,
        _id: userDoc._id?.toString() || userDoc.id,
        name: userDoc.name || "Member",
        email: userDoc.email,
        phone: userDoc.phone || "",
        image: userDoc.image || "/default-avatar.png",
        avatar: userDoc.image || "/default-avatar.png",
        role: userDoc.role || "user",
        location: userDoc.location || "",
        bio: userDoc.bio || "",
        updatedAt: userDoc.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Updates user profile details directly in MongoDB Atlas 'user' collection.
 * Body: { name, phone, image, location, bio, email, id }
 */
export async function PATCH(request) {
  return handleProfileUpdate(request);
}

export async function PUT(request) {
  return handleProfileUpdate(request);
}

export async function POST(request) {
  return handleProfileUpdate(request);
}

async function handleProfileUpdate(request) {
  try {
    const body = await request.json();
    const { name, phone, image, location, bio, email, id } = body;

    let targetEmail = email?.toLowerCase()?.trim();
    let targetId = id;

    // If neither email nor id provided in body, extract from active Better-Auth session
    if (!targetEmail && !targetId) {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        if (session?.user?.email) {
          targetEmail = session.user.email.toLowerCase().trim();
        }
        if (session?.user?.id) {
          targetId = session.user.id;
        }
      } catch (err) {
        console.warn("Session retrieval fallback in profile update:", err.message);
      }
    }

    if (!targetEmail && !targetId) {
      return NextResponse.json(
        { success: false, message: "User email or identifier is required to update profile" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userCollection = db.collection("user");

    const queryConditions = [];
    if (targetEmail) {
      queryConditions.push({ email: targetEmail });
    }
    if (targetId) {
      queryConditions.push({ _id: targetId });
      queryConditions.push({ id: targetId });
    }

    const userDoc = await userCollection.findOne({ $or: queryConditions });

    const updateFields = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined && name !== null) {
      updateFields.name = String(name).trim();
    }
    if (phone !== undefined && phone !== null) {
      updateFields.phone = String(phone).trim();
    }
    if (image !== undefined && image !== null) {
      updateFields.image = String(image).trim();
    }
    if (location !== undefined && location !== null) {
      updateFields.location = String(location).trim();
    }
    if (bio !== undefined && bio !== null) {
      updateFields.bio = String(bio).trim();
    }

    if (userDoc) {
      await userCollection.updateOne(
        { _id: userDoc._id },
        { $set: updateFields }
      );
    } else {
      // If user document didn't exist yet, insert with defaults
      await userCollection.updateOne(
        { email: targetEmail || targetId },
        {
          $set: {
            ...updateFields,
            email: targetEmail || targetId,
            role: "user",
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    const updated = await userCollection.findOne({
      $or: queryConditions.length > 0 ? queryConditions : [{ email: targetEmail }],
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully in MongoDB database",
      user: {
        id: updated._id?.toString() || updated.id,
        _id: updated._id?.toString() || updated.id,
        name: updated.name || name || "Member",
        email: updated.email || targetEmail,
        phone: updated.phone || phone || "",
        image: updated.image || image || "/default-avatar.png",
        avatar: updated.image || image || "/default-avatar.png",
        role: updated.role || "user",
        location: updated.location || location || "",
        bio: updated.bio || bio || "",
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile update error in /api/user/profile:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile in database" },
      { status: 500 }
    );
  }
}
