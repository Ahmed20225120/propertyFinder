
import { RequestHandler, NextFunction, Response } from "express";
import { JwtHandler } from "../utils/jwtHandler.util";
import { RequestUtil } from "../utils/request.util";
import { Role } from "../types/role.types";


export const authorize = (...validRole: Role[]): RequestHandler => 
{
  return (req, res, next) =>
    {
        const role = RequestUtil.getRole(req) as Role;

        if (!role) return res.status(401).json({ message: "role not found" });

        let isValid = validRole.includes(role);

        if (isValid) 
            next();
        
        else 
            return res.status(401).json({ message: "Unauthorized" });
        
  };
};
