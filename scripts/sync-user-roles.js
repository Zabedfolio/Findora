const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb+srv://findora:wXunYVhWrYW4PwDU@cluster0.mldxc9s.mongodb.net/";
const dbName = process.env.MONGODB_NAME || "findora";

async function syncUserRoles() {
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
      console.log(`- User [${u._id}]: ${u.name} <${u.email}> | current role: ${u.role || "(none)"}`);
      
      let targetRole = u.role;
      if (!targetRole) {
        // Admin for zabedfolio@gmail.com or admin emails, default user for others
        if (u.email === "zabedfolio@gmail.com" || u.email.toLowerCase().includes("admin")) {
          targetRole = "admin";
        } else {
          targetRole = "user";
        }
      }

      // Update document if role was missing or needs assignment
      await userCollection.updateOne(
        { _id: u._id },
        { 
          $set: { 
            role: targetRole,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      console.log(`  -> Synced to role: '${targetRole}' in MongoDB.`);
    }

    console.log("\nVerifying updated documents in MongoDB:");
    const verifiedUsers = await userCollection.find({}).toArray();
    console.log(JSON.stringify(verifiedUsers, null, 2));

    console.log("\nAll user roles synced successfully in MongoDB!");
  } catch (error) {
    console.error("Error syncing user roles:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

syncUserRoles();
