
import { RequestHandler, NextFunction, Response } from "express";
import { JwtHandler } from "../utils/jwtHandler.util";
import { RequestUtil } from "../utils/request.util";
import { Role } from "../types/role.types";


export const authorize = (validRole: Role): RequestHandler => 
{
  return (req, res, next) =>
    {
        const role = RequestUtil.getRole(req);

        if (!role) return res.status(401).json({ message: "role not found" });

        if (role === validRole) 
            next();
        
        else 
            return res.status(401).json({ message: "Unauthorized" });
        
  };
};
