import { ObjectId } from "mongodb"
import { database } from "../database/db";
import { config } from "dotenv";
config();

export interface User
{
    _id: ObjectId,
    name:
    {
        first: string,
        family: string
    },
    email: string,
    password: string
}

const userCollention = process.env.usersCollection ?? "users";

export const users = database.collection<User>(userCollention);