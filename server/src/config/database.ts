import { MongoClient, Db } from "mongodb";
import { MONGO_URL } from "./environment";

let db: Db;
async function connectToDatabase() {
  try {
    if (!MONGO_URL) throw new Error("MONGO_URL is not defined");

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db("mydatabase");
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
}

const getDb = () => db;

export { connectToDatabase, getDb };
