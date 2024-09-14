import { RequestHandler } from "express";
import { RequestUtil } from "../utils/request.util";
import { JwtHandler } from "../utils/jwtHandler.util";

/*
1) take the token from the header
2) verify the token
3) if verified, call next
4) if not verified, return error
*/

export const authenticate: RequestHandler = (req, res, next) => 
{
    let token = RequestUtil.getToken(req);

    if(!token)
        return res.status(401).json({message: "Unauthorized"});

    
    let isVerified = JwtHandler.verifyToken(token);
    
    if( isVerified === true )
        next();
    
    else
        return res.status(401).json({message: isVerified});
}