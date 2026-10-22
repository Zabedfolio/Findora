/**
 * Avatar & ImgBB Service
 * Automatically generates a modern vector avatar and uploads it to ImgBB
 * so that users without a profile picture get a permanent hosted ImgBB vector image.
 */

const DEFAULT_IMGBB_KEY = "c7ee77db12d04d4f5b27b44a8a9d346b";

/**
 * Generate a vector avatar and upload it to ImgBB.
 * @param {Object} options
 * @param {string} options.name - User's display name
 * @param {string} options.email - User's email
 * @param {string} [options.style] - Vector style: 'lorelei', 'bottts', 'adventurer', 'thumbs'
 * @returns {Promise<string>} The uploaded ImgBB URL (or vector avatar fallback)
 */
export async function generateAndUploadVectorAvatar({
  name = "",
  email = "",
  style = "lorelei",
} = {}) {
  const apiKey =
    process.env.IMGBB_API_KEY ||
    DEFAULT_IMGBB_KEY;

  // Clean seed string from name or email
  const rawSeed = (name || email || "FindoraMember").trim();
  const seed = encodeURIComponent(rawSeed.replace(/[^a-zA-Z0-9_-]/g, "") || "FindoraMember");

  // Premium vector avatar generator URL (PNG format with vector rendering)
  const vectorAvatarUrl = `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&backgroundColor=070b04,0f172a,064e3b,111827`;

  try {
    const formData = new FormData();
    formData.append("image", vectorAvatarUrl);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.data?.url) {
        return data.data.url;
      }
    }
    console.warn("ImgBB upload returned non-success, using vector fallback");
  } catch (error) {
    console.warn("Failed to upload vector avatar to ImgBB:", error.message);
  }

  // Graceful fallback: return the high-resolution vector avatar URL directly
  return vectorAvatarUrl;
}

/**
 * Checks a user object/document; if they lack an image or have an empty string,
 * automatically generates and uploads a vector avatar to ImgBB.
 * @param {Object} user
 * @returns {Promise<string>} Valid image URL
 */
export async function ensureUserAvatar(user) {
  if (user?.image && typeof user.image === "string" && user.image.trim() !== "" && !user.image.includes("default-avatar.png")) {
    return user.image;
  }

  return await generateAndUploadVectorAvatar({
    name: user?.name,
    email: user?.email,
  });
}
