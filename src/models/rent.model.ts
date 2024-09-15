import { ObjectId } from "mongodb"
import { database } from "../database/db";
import { config } from "dotenv";
config();

export interface Rent
{
    _id: ObjectId,
    userId: ObjectId,
    propertyId: ObjectId,
    start_date: Date,
    end_date: Date
}

const rentsCollention = process.env.rentsCollection ?? "rents";

export const rents = database.collection<Rent>(rentsCollention);