import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();

const dbName = process.env.dbName ?? 'test';
const dbUri = process.env.MONGO_URI ?? "mongodb://localhost:27017";

const client = new MongoClient(dbUri);

export const database = client.db(dbName);

