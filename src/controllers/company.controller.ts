import { Request, Response } from "express";
import { RequestUtil } from "../utils/request.util";
import { JwtHandler } from "../utils/jwtHandler.util";
import { db } from "../database";
import { UserRegisterResponse } from "../interfaces/user/userRegister.response";
import { BcryptHandler } from "../utils/bcryptHandler.util";
import { ObjectId } from "mongodb";
import { MailHandler } from "../utils/mailHandler.util";
import { MailBody } from "../interfaces/mail/mailBody.interface";
import { UserLoginResponse } from "../interfaces/user/userLogin.response";
import { UserLoginRequest } from "../interfaces/user/userLogin.request";
import { UserToken } from "../interfaces/user/user.token";
import { CompanyRegisterRequest } from "../interfaces/company/companyRegister.request";
import { NewAgentRequest } from "../interfaces/agent/newAgent.request";
import { ListAgentsProject } from "../interfaces/agent/listAgents.projection";
import { ListCompanyProject } from "../interfaces/company/ListCompany.project";
import { FileHandler } from "../utils/fileHandler.util";

/*

1) register:
    1.1) check if request body is valid
    1.2) check if user already exists
    1.3) if exists, return error
    1.4) if not exists, create user
        1.4.1) hash password with bcrypt
        1.4.2) save user in database
        1.4.3) send welcome email
        1.4.4) generate token
    1.5) return success with token
*/

const register = async (req: Request<{}, UserRegisterResponse, CompanyRegisterRequest, {}>, res: Response) =>
{   
    if(RequestUtil.hasBody(req))
        return res.status(400).json({message: "request body is empty"});

    let {email , password, name, phone, address, job} = req.body; 

    if(!email || !password || !name || !phone || !address || !job)
        return res.status(400).json({message: "request body is invalid"});

    let user = await db.companies.findOne({email: email});

    if(user)
        return res.status(400).json({message: "user already exists"});

    let hashedPassword = BcryptHandler.hashPassword(password);
    let id = new ObjectId();

    await db.companies.insertOne({_id: id , name: name, email: email , password: hashedPassword, role: "company", address: address, phone: phone, job: job});

    let emailBody : MailBody = 
    {
        to: email,
        subject: "welcome"
    }
    MailHandler.welcomeMail(emailBody);

    let token = JwtHandler.generateToken({email: email, id: id, role: "company"});

    return res.status(200).json({token: token, message: "company created successfully"});


}

/*

2) login:

    2.1) check if request body is valid
    2.2) check if user exists
    2.3) if not exists, return error
    2.4) if exists, return success with token

*/
const login = async (req: Request<{}, UserLoginResponse, UserLoginRequest, {}>, res: Response) =>
{   
    if(RequestUtil.hasBody(req))
        return res.status(400).json({message: "request body is empty"});

    let {email , password} = req.body;

    let user = await db.companies.findOne({email});

    if(!user)
        return res.status(400).json({message: "user not found"});

    if(!BcryptHandler.comparePassword(password, user.password))
        return res.status(400).json({message: "wrong password"});

    let token = JwtHandler.generateToken({email, id: user._id, role: user.role});

    return res.status(200).json({token: token, message: "user logged in successfully"});
    
}

/*

3) create agents :

    3.1) check if request body is valid
    3.2) check if user exists
    3.3) if exists, return error
    3.4) if not exists
        3.4.1) create user
        3.4.2) hash password with bcrypt
        3.4.3) save user in database
    3.5) return success

*/

const create = async (req: Request<{}, {}, NewAgentRequest, {}>, res: Response) =>
{
    if(RequestUtil.hasBody(req))
        return res.status(400).json({message: "request body is empty"});

    let companyId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;

    let {email , password, name, phone} = req.body;

    if(!email || !password || !name || !phone)
        return res.status(400).json({message: "request body is invalid"});

    let agent = await db.agents.findOne({email: email});

    if(agent)
        return res.status(400).json({message: "agent already exists"});

    let hashedPassword = BcryptHandler.hashPassword(password);
    let id = new ObjectId();    

    await db.agents.insertOne({_id: id , name: name, email: email , password: hashedPassword, role: "agent", companyId: (companyId as unknown as ObjectId), phone: phone});

    return res.status(200).json({message: "agent created successfully"});
}

/*
4) get all agents:

    4.1) get all agents of company
    4.2) return success with agents
*/

const getAll = async (req: Request<{}, {}, {}, {}>, res: Response) =>
{   
    let companyId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;

    let agents = await db.agents.find({companyId: (companyId as unknown as ObjectId)}, {projection: ListAgentsProject}).toArray();

    return res.status(200).json({agents: agents});
}

/*
5) delete agent:    

    5.1) check if parameter is valid
    5.2) check if user exists
    5.3) if not exists, return error
    5.4) if exists
        5.4.1) delete user
    5.5) return success
*/

const deleteAgent = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{   
    let agentId = req.params.id;

    if(!agentId)
        return res.status(400).json({message: "agent id is invalid"});

    let agent = await db.agents.findOneAndDelete({_id: new ObjectId(agentId)});
    
    if(!agent)
        return res.status(400).json({message: "agent not found"});
    
    return res.status(200).json({message: "agent deleted successfully", data: {agent}});
}

/*
6) update agent:

    6.1) check if parameter is valid
    6.2) check if user exists
    6.3) if not exists, return error
    6.4) if exists
        6.4.1) update user
    6.5) return success
*/

const updateAgent = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{   
    let agentId = req.params.id;

    if(!agentId)
        return res.status(400).json({message: "agent id is invalid"});

    let agent = await db.agents.findOneAndUpdate({_id: new ObjectId(agentId)}, {$set: req.body});

    if(!agent)
        return res.status(400).json({message: "agent not found"});
    
    return res.status(200).json({message: "agent updated successfully"});
}


/*
7) get one agent:

    7.1) check if parameter is valid
    7.2) check if user exists
    7.3) if not exists, return error
    7.4) if exists
        7.4.1) return success with agent
*/

const getOne = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{
    let agentId = req.params.id;

    if(!agentId)
        return res.status(400).json({message: "agent id is invalid"});

    let agent = await db.agents.findOne({_id: new ObjectId(agentId)}, {projection: ListAgentsProject});
    
    if(!agent)
        return res.status(400).json({message: "agent not found"});
    
    return res.status(200).json({agent: agent});
}


/*
8) update:

    8.1) check if request body is valid
    8.2) check if company exists
    8.3) if not exists, return error
    8.4) if exists
        8.4.1) update company
    8.5) return success
*/

const update = async (req: Request<{}, {}, {}, {}>, res: Response) =>
{
    let companyId = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).id;

    if(!companyId)
        return res.status(400).json({message: "company id is invalid"});


    if(!req.file)
        return res.status(400).json({message: "image is required"});

    let fileName = req.file?.originalname ?? "";
    let stored_name = fileName+Date.now()+"."+req.file.mimetype.split('/')[1];

    FileHandler.writeFile('./public/images/' + stored_name, req.file.buffer);
    
    let company = await db.companies.findOneAndUpdate({_id: new ObjectId(companyId)}, {$set: {image: stored_name}});
    
    if(!company)
        return res.status(400).json({message: "company not found"});
    
    company = await db.companies.findOne({_id: new ObjectId(companyId)}, {projection: ListCompanyProject});
    return res.status(200).json({message: "company updated successfully", company: company});
}

const getProfile = async (req: Request<{id: string}, {}, {}, {}>, res: Response) =>
{
    let companyId = req.params.id; 

    if(!companyId)
        return res.status(400).json({message: "company id is invalid"});

    let company = await db.companies.findOne({_id: new ObjectId(companyId)}, {projection: ListCompanyProject});
    
    if(!company)
        return res.status(400).json({message: "company not found"});
    
    return res.status(200).json({company: company});
}

export const companyController = 
{ 
    register,
    login,
    create,
    getAll,
    deleteAgent,
    update,
    getOne,
    updateAgent,
    getProfile
}
