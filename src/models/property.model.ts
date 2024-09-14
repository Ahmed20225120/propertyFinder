import { PropertyRealeses, PropertyType } from "../types/property.types";
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
    isFree: boolean,
    release_for : PropertyRealeses,
    type : PropertyType,
    payment_method : string,
    bed_room : number,
    bath_room : number
}

const propertiesCollection = process.env.propertiesCollection ?? "properties";

export const properties = database.collection<Property>(propertiesCollection);