import { Request, Response } from "express";
import { RequestUtil } from "../utils/request.util";
import { JwtHandler } from "../utils/jwtHandler.util";
import { db } from "../database";
import { ObjectId } from "mongodb";
import { UserToken } from "../interfaces/user/user.token";
import { FileHandler } from "../utils/fileHandler.util";
import { CreateBlogRequest } from "../interfaces/blog/createBlog.request";
import { BlogProject } from "../interfaces/blog/blog.projection";




const create = async (req: Request<{}, {}, CreateBlogRequest, {}>, res: Response) =>
{
    if(RequestUtil.hasBody(req))
        return res.status(400).json({message: "request body is empty"});

    let {title, description, date} = req.body;  

    if(!title || !description || !date)
        return res.status(400).json({message: "request body is invalid"});  

    if(!req.files && !Array.isArray(req.files))
        return res.status(400).json({message: "image is required"});
    
    let companyId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;
    
    if(!companyId)
        return res.status(400).json({message: "companyId is required"});

    let stored_name : string;
    let imagesName : string[] = [];

    if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
            let fileName = file.originalname ?? "file";
            stored_name = fileName+Date.now()+"."+file.mimetype.split('/')[1];
            FileHandler.writeFile('./public/images/' + stored_name, file.buffer);
            imagesName.push(stored_name);
        });
    } else {
        let fileName = req.file?.originalname ?? "file";
        stored_name = fileName+Date.now()+"."+req.file?.mimetype.split('/')[1];
        FileHandler.writeFile('./public/images/' + stored_name, req.file?.buffer as Buffer);
        imagesName.push(stored_name);
    }

    let id = new ObjectId();

    await db.blogs.insertOne({_id: id,companyId: (companyId as unknown as ObjectId) ,title: title, description: description, date: date, images: imagesName});
   

    return res.status(200).json({message: "blog created successfully"});
}


const getAll = async (req: Request<{}, {}, {}, {}>, res: Response) =>
{   
    let blogs = await db.blogs.find({}, {projection: BlogProject}).toArray();

    return res.status(200).json(blogs);
}




const deleteBlog = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{   
    let id = req.params.id;

    await db.blogs.deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({message: "blog deleted successfully"});
}




const getOne = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{
    let id = req.params.id;
    let blog = await db.blogs.findOne({ _id: new ObjectId(id) });
    return res.status(200).json(blog);
}




const update = async (req: Request<{}, {}, {}, {}>, res: Response) =>
{
    
}



export const blogController = 
{ 
    
    create,
    getAll,
    deleteBlog,
    getOne,
    update,
    
}
