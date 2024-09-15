import { ObjectId } from "mongodb";
import { database } from "../database/db";
import { config } from "dotenv";
import { Role } from "../types/role.types";
config();

export interface Agent
{
    _id: ObjectId,
    name:
    {
        first: string,
        second: string
    },
    email: string,
    password: string,
    phone: string,
    role: Role,
    companyId: ObjectId
}

const agentCollention = process.env.agentsCollection ?? "agents";

export const agents = database.collection<Agent>(agentCollention);
