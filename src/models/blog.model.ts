import { ObjectId } from "mongodb";
import { database } from "../database/db";
import { config } from "dotenv";
config();

export interface Blog
{
    _id: ObjectId,
    companyId: ObjectId,
    date: Date,
    title: string,
    description: string,
    images: string[]
}

const blogsCollection = process.env.blogsCollection ?? "blogs";

export const blogs = database.collection<Blog>(blogsCollection);