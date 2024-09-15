import { Request, Response } from "express";
import { RequestUtil } from "../utils/request.util";
import { JwtHandler } from "../utils/jwtHandler.util";
import { db } from "../database";
import { BcryptHandler } from "../utils/bcryptHandler.util";
import { UserLoginResponse } from "../interfaces/user/userLogin.response";
import { UserLoginRequest } from "../interfaces/user/userLogin.request";
import { UserToken } from "../interfaces/user/user.token";
import { ViewAgentProfileProject } from "../interfaces/agent/viewProfile.projection";



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

    let user = await db.agents.findOne({email});

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

    let user = await db.agents.findOne({email: userEmail}, {projection: ViewAgentProfileProject});

    return res.status(200).json(user);
}
 
export const agentController = 
{ 
    login,
    view,
}
