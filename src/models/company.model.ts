import { ObjectId } from "mongodb";
import { database } from "../database/db";
import { config } from "dotenv";
config();

export interface Company
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
    job: string,
    address: string,
    image: string
}


const companyCollention = process.env.companiesCollection ?? "companies";

export const companies = database.collection<Company>(companyCollention);