import { ObjectId } from "mongodb";
import { database } from "../database/db";
import { config } from "dotenv";
config();

export interface Property
{
    _id: ObjectId,
    companyId: ObjectId,
    agentId: ObjectId,
    name: string,
    images: string[],
    description: string,
    price: number,
    list_date: Date,
    location: string,
    release_for : string,
    isFree: boolean,
    type : string,
    payment_method : string,
    bed_room : number,
    bath_room : number
}

const propertiesCollection = process.env.propertiesCollection ?? "properties";

export const properties = database.collection<Property>(propertiesCollection);