import { Request, Response } from "express";
import { RequestUtil } from "../utils/request.util";
import { JwtHandler } from "../utils/jwtHandler.util";
import { db } from "../database";
import { UserRegisterRequest } from "../interfaces/user/userRegister.request";
import { UserRegisterResponse } from "../interfaces/user/userRegister.response";
import { BcryptHandler } from "../utils/bcryptHandler.util";
import { ObjectId } from "mongodb";
import { MailHandler } from "../utils/mailHandler.util";
import { MailBody } from "../interfaces/mail/mailBody.interface";
import { UserLoginResponse } from "../interfaces/user/userLogin.response";
import { UserLoginRequest } from "../interfaces/user/userLogin.request";
import { UserToken } from "../interfaces/user/user.token";
import { ViewProfileProject } from "../interfaces/user/viewProfile.projection";
import { SentMailRequest } from "../interfaces/mail/sentMail.request";
import { emitWarning } from "process";
import { AllPropertiesProject } from "../interfaces/property/property.projection";


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

const register = async (req: Request<{}, UserRegisterResponse, UserRegisterRequest, {}>, res: Response) =>
{   
    if(RequestUtil.hasBody(req))
        return res.status(400).json({message: "request body is empty"});

    let {email , password} = req.body; 


    let user = await db.users.findOne({email: email});

    if(user)
        return res.status(400).json({message: "user already exists"});

    let hashedPassword = BcryptHandler.hashPassword(password);
    let id = new ObjectId();

    await db.users.insertOne({_id: id , name: {first: "", family: ""}, email: email , password: hashedPassword, role: "user", saved: []});


    let emailBody : MailBody = 
    {
        to: email,
        subject: "welcome"
    }
    MailHandler.welcomeMail(emailBody);

    let token = JwtHandler.generateToken({email: email, id: id, role: "user"});

    return res.status(200).json({token: token, message: "user created successfully"});


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

    let user = await db.users.findOne({email});

    if(!user)
        return res.status(400).json({message: "user not found"});

    if(!BcryptHandler.comparePassword(password, user.password))
        return res.status(400).json({message: "wrong password"});

    let token = JwtHandler.generateToken({email, id: user._id, role: user.role});

    return res.status(200).json({token: token, message: "user logged in successfully"});
    
}

/*

3) view profile:

    3.1) get email from token
    3.2) get user from database
    3.3) return user

*/

const view = async (req: Request, res: Response) =>
{   
    let userEmail = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;

    let user = await db.users.findOne({email: userEmail}, {projection: ViewProfileProject});

    return res.status(200).json(user);
}

/*

4) update profile:

    4.1) get email from token
    4.2) get user from database
    4.3) update user
    4.4) return success and user
*/

const update = async (req: Request, res: Response) =>
{   
    let userEmail = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;

    let user = await db.users.findOne({email: userEmail});

    let {name} = req.body;

    await db.users.updateOne({email: userEmail}, {$set: {name: name}});

    user = await db.users.findOne({email: userEmail}, {projection: ViewProfileProject});

    return res.status(200).json({message: "user updated successfully", user: user});
}  

/*

5) save:
    5.1) check if parameter is valid
    5.2) get email from token
    5.3) get user from database
    5.4) save property
    5.5) return success
*/

const save = async (req: Request, res: Response) =>
{   
    const objectIdLength = 24;
    
    let propertyId = req.params.id ?? "";

    if(propertyId.length != objectIdLength )
        return res.status(400).json({message: "property id is not provided"});

    let userEmail = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;

    let user = await db.users.findOne({email: userEmail});
    
    if(!user)
        return res.status(400).json({message: "user not found"});
    
    if(user.saved.includes(propertyId as unknown as ObjectId))
        return res.status(400).json({message: "property already saved"});
    
    try
    {
        await db.users.updateOne({email: userEmail}, {$push: {saved: (propertyId as unknown as ObjectId)}});
    }
    catch(error : any)
    {
        console.log(error.message);
        return res.status(500).json({message: "internal server error",
            error: error.message
        });
    }

    return res.status(200).json({message: "property saved successfully"});
}


/*

6) unsave:

    6.1) check if parameter is valid
    6.2) get email from token
    6.3) get user from database
    6.4) check if property is saved 
    6.5) unsave property
    6.6) return success


*/

const unsave = async (req: Request, res: Response) =>
{   
    const objectIdLength = 24;
    let propertyId = req.params.id ?? "";

    if(propertyId.length != objectIdLength )
        return res.status(400).json({message: "property id is not provided"});

    let userEmail = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;

    let user = await db.users.findOne({email: userEmail});

    console.log(propertyId);

    if(!user)
        return res.status(400).json({message: "user not found"});

    if(!user.saved.includes(propertyId as unknown as ObjectId))
        return res.status(400).json({message: "property not saved"});
    
    try
    {
        await db.users.updateOne({email: userEmail}, {$pull: {saved: (propertyId as unknown as ObjectId)}});
    }
    catch(error : any)
    {
        console.log(error.message);
        return res.status(500).json({message: "internal server error",
            error: error.message
        });
    }

    return res.status(200).json({message: "property unsaved successfully"});


}


/*

7) mailAgent:
    
    7.1) check if body is valid
    7.2) get email from token
    7.3) send mail
    7.4) return success

*/

const mailAgent = async (req: Request<{},{message: string}, SentMailRequest ,{}>, res: Response) =>
{
    let email = req.body;

    if(!email)
        return res.status(400).json({message: "email is not provided"});

    let userEmail = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;

    let mailData: MailBody = {
        from: userEmail,
        to: email.to,
        subject: email.subject,
        text: email.text
    };

    let mailSent = await MailHandler.sendMail(mailData);

    if(!mailSent)
        return res.status(500).json({message: "Mail could not be sent"});

    return res.status(200).json({message: "Mail sent successfully", data: {mailData}});

}

const allSaved = async (req: Request, res: Response) =>
{
    let userEmail = JwtHandler.getPayload<UserToken>(RequestUtil.getToken(req)).email;

    let user = await db.users.findOne({email: userEmail});

    if(!user)
        return res.status(400).json({message: "user not found"});

    let profileWithSaved = await db.users.aggregate([
        {
            $lookup: {
                from: 'properties',
                localField: 'saved',
                foreignField: '_id',
                as: 'saved'
            }
        },
        {
            $project:
            {
                _id: 0,
                name: 1,
                email: 1,
                saved: 
                {
                    AllPropertiesProject
                }
            }
        }
    ])

    return res.status(200).json({message: "success", data: profileWithSaved});
}
export const userController = 
{ 
    register,
    login,
    view,
    update,
    save,
    unsave,
    mailAgent
}
