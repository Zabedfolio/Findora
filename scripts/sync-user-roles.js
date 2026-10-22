const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb+srv://findora:wXunYVhWrYW4PwDU@cluster0.mldxc9s.mongodb.net/";
const dbName = process.env.MONGODB_NAME || "findora";
const IMGBB_KEY = process.env.IMGBB_API_KEY || "c7ee77db12d04d4f5b27b44a8a9d346b";

async function uploadVectorAvatarToImgBB(name, email) {
  const rawSeed = (name || email || "FindoraMember").trim();
  const seed = encodeURIComponent(rawSeed.replace(/[^a-zA-Z0-9_-]/g, "") || "FindoraMember");
  const vectorUrl = `https://api.dicebear.com/7.x/lorelei/png?seed=${seed}&backgroundColor=070b04,0f172a,064e3b,111827`;

  console.log(`  -> Uploading vector avatar for '${name}' to ImgBB...`);
  const formData = new FormData();
  formData.append("image", vectorUrl);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data?.success && data?.data?.url) {
    console.log(`  -> ImgBB URL generated: ${data.data.url}`);
    return data.data.url;
  }
  console.warn("  -> ImgBB returned non-success, fallback to vectorUrl:", data);
  return vectorUrl;
}

async function syncUserRolesAndAvatars() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB.");
    const db = client.db(dbName);
    const userCollection = db.collection("user");

    const users = await userCollection.find({}).toArray();
    console.log(`Found ${users.length} user(s) in collection 'user':`);

    for (const u of users) {
      console.log(`\nProcessing user [${u._id}]: ${u.name} <${u.email}>`);
      
      let targetRole = u.role;
      if (!targetRole) {
        if (u.email === "zabedfolio@gmail.com" || u.email.toLowerCase().includes("admin")) {
          targetRole = "admin";
        } else {
          targetRole = "user";
        }
      }

      let targetImage = u.image;
      if (!targetImage || typeof targetImage !== "string" || targetImage.trim() === "") {
        targetImage = await uploadVectorAvatarToImgBB(u.name, u.email);
      }

      // Update document
      await userCollection.updateOne(
        { _id: u._id },
        { 
          $set: { 
            role: targetRole,
            image: targetImage,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      console.log(`  -> Synced user in MongoDB: role='${targetRole}', image='${targetImage}'`);
    }

    console.log("\n--- Verification in MongoDB ---");
    const verifiedUsers = await userCollection.find({}).toArray();
    console.log(JSON.stringify(verifiedUsers, null, 2));

    console.log("\nAll user roles and ImgBB vector avatars synced successfully in MongoDB!");
  } catch (error) {
    console.error("Error syncing users:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

syncUserRolesAndAvatars();
