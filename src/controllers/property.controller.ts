import { Request, Response } from "express";
import { RequestUtil } from "../utils/request.util";
import { JwtHandler } from "../utils/jwtHandler.util";
import { db } from "../database";
import { ObjectId } from "mongodb";
import { UserToken } from "../interfaces/user/user.token";
import { FileHandler } from "../utils/fileHandler.util";
import { CreatePropertyRequest } from "../interfaces/property/createProperty.request";
import { AllPropertiesProject } from "../interfaces/property/property.projection";
import { UpdatePropertyRequest } from "../interfaces/property/updateProperty.request";
import { MailHandler } from "../utils/mailHandler.util";
import { MailBody } from "../interfaces/mail/mailBody.interface";


function isBodyVaid(req : CreatePropertyRequest)
{
    return !req.name || !req.description || !req.location || !req.price  || !req.isFree || !req.release_for || !req.type || !req.payment_method || !req.bed_room || !req.bath_room;
}

const create = async (req: Request<{}, {}, CreatePropertyRequest, {}>, res: Response) =>
{
    if(RequestUtil.hasBody(req))
        return res.status(400).json({message: "request body is empty"});

    let {name, description, location, price, isFree, release_for, type, payment_method, bed_room, bath_room} = req.body;  
    
    if(isBodyVaid(req.body))
        return res.status(400).json({message: "request body is invalid"});  

    if(!req.files && !Array.isArray(req.files))
        return res.status(400).json({message: "image is required"});
    
    let role = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).role;
    
    let companyId: string;
    let agentId: string;
    
    if(role === "agent")
    {
        agentId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;
        companyId = await db.agents.findOne({_id: new ObjectId(agentId)}, {projection: {companyId: 1}}) as any;
    }else
    {
        companyId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;
        agentId = companyId;
    }

    if(!companyId || !agentId)
        return res.status(400).json({message: "companyId and agentId is required"});


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
    let list_date = (Date.now().toString() as unknown as Date);
    
    await db.properties.insertOne({_id: id, name, description, location, price, list_date, isFree, release_for, type, payment_method, bed_room, bath_room, companyId: (companyId as unknown as ObjectId), agentId: ( agentId as unknown as ObjectId), images: imagesName});

    return res.status(200).json({message: "property created successfully"});
}


const getAll = async (req: Request<{}, {}, {}, {}>, res: Response) =>
{   
    let properties = await db.properties.find({}, {projection: AllPropertiesProject}).toArray();

    return res.status(200).json(properties);
}




const deleteProperty = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{   
    let id = req.params.id;

    let property = await db.properties.findOneAndDelete({ _id: new ObjectId(id) });

    if(!property)
        return res.status(400).json({message: "property not found"});

    if(property.images)
    {
        property.images.forEach((image) => {
            FileHandler.deleteFile('./public/images/' + image);
        });
    }

    return res.status(200).json({message: "properties deleted successfully"});
}




const getOne = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{
    let id = req.params.id;
    let property = await db.properties.findOne({ _id: new ObjectId(id) });
    return res.status(200).json(property);
}



function hasBodyToUpdate(req : UpdatePropertyRequest)
{
    return !req.price  || !req.isFree || !req.payment_method ;
}

const update = async (req: Request<{ id: string}, {}, UpdatePropertyRequest, {}>, res: Response) =>
{
    if(hasBodyToUpdate(req.body))
        return res.status(400).json({message: "request body is empty"});

    let { price, isFree,  payment_method} = req.body;

    let id = req.params.id;

    let property = await db.properties.findOneAndUpdate({_id: new ObjectId(id)}, {$set: {price, isFree, payment_method}});

    if(!property)
        return res.status(400).json({message: "property not found"});

    return res.status(200).json({message: "property updated successfully"});
}


const getRent = async (req: Request, res: Response) =>
{
    let properties = await db.properties.find({release_for: "rent"}).toArray();
    return res.status(200).json(properties);
}


const getBuy = async (req: Request, res: Response) =>
{
    let properties = await db.properties.find({release_for: "buy"}).toArray();
    return res.status(200).json(properties);
}

const buyProperty = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{
    let id = req.params.id;
    let property = await db.properties.findOneAndUpdate({_id: new ObjectId(id), isFree: true}, {$set: {isFree: false}});
    
    let userId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;

    let contract_id = new ObjectId();

    await db.buys.insertOne({_id: contract_id,userId: new ObjectId(userId), propertyId: new ObjectId(property?._id), date: new Date()});
    
    let buyRecord = await db.buys.findOne({_id: new ObjectId(contract_id)}); 

    let recipient = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;
    
    let emailBody : MailBody = 
    {
        to: recipient,
        subject: "buy property",
        html: `<h1>you have successfully buy property</h1>
        <p>property name: ${property?.name}</p>
        <p>property address: ${property?.location}</p>
        <p>property price: ${property?.price}</p>
        <p>property id: ${property?._id}</p>
        <p>property date: ${buyRecord?.date}</p>`
    }
    MailHandler.sendMail(emailBody);

    return res.status(200).json(buyRecord);
}

const rentProperty = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{
    let id = req.params.id;
    
    let property = await db.properties.findOne({ _id: new ObjectId(id)} );


    if (!property) return res.status(400).json({ message: "property not found" });
    
    if (property.isFree == false) return res.status(400).json({ message: "property is not free" });

    await db.properties.updateOne({ _id: new ObjectId(id)},
    { $set: { isFree: false }});

    let userId = JwtHandler.getPayload<UserToken>(
    RequestUtil.getToken(req)
    ).id;

    let contract_id = new ObjectId();

    await db.rents.insertOne({
    _id: contract_id,
    userId: new ObjectId(userId),
    propertyId: new ObjectId(property?._id),
    start_date: new Date(),
    end_date: new Date(new Date().getDate() * 300 * 240 * 600 * 600 * 1000),
    });

    let rentRecord = await db.rents.findOne({ _id: new ObjectId(contract_id) });

    let recipient = JwtHandler.getPayload<UserToken>(
    RequestUtil.getToken(req)
    ).email;

    let emailBody: MailBody = {
    to: recipient,
    subject: "buy property",
    html: `<h1>you have successfully rented property</h1>
        <p>property name: ${property?.name}</p>
        <p>property address: ${property?.location}</p>
        <p>property price: ${property?.price}</p>
        <p>property id: ${property?._id}</p>
        <p>property start date: ${rentRecord?.start_date}</p>
        <p>property end date: ${rentRecord?.end_date}</p>`,
    };
    MailHandler.sendMail(emailBody);

    return res.status(200).json(rentRecord);
}
export const propertyController = 
{ 
    
    create,
    getAll,
    deleteProperty,
    getOne,
    update,
    getRent,
    getBuy,
    buyProperty,
    rentProperty
    
}
