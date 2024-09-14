import { ObjectId } from "mongodb"
import { database } from "../database/db";
import { config } from "dotenv";
import { Role } from "../types/role.types";
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
    password: string,
    role: Role,
    saved: ObjectId[]
}

const userCollention = process.env.usersCollection ?? "users";

export const users = database.collection<User>(userCollention);