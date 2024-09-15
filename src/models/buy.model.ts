import { ObjectId } from "mongodb"
import { database } from "../database/db";
import { config } from "dotenv";
config();

export interface Buy
{
    _id: ObjectId,
    userId: ObjectId,
    propertyId: ObjectId,
    date: Date
}

const buysCollention = process.env.buysCollection ?? "buys";

export const buys = database.collection<Buy>(buysCollention);