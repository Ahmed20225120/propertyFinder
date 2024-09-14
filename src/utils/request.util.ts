import { Request } from "express";
import { JwtHandler } from "./jwtHandler.util";
import { HeaderAuth } from "../interfaces/header/header.interface";

export class RequestUtil
{
    public static getBody(request: Request)
    {
        return request.body
    }

    public static getQuery(request: Request)
    {
        return request.query
    }

    public static getParamsByKey(request: Request, key: string)
    {
        return request.params.key;
    }

    public static getHeaders(request: Request)
    {
        return request.headers
    }

    public static getToken(request: Request): string
    {
        return request.headers.authorization?.split(' ')[1] ?? "";
    }

    public static getRole(request: Request) : string
    {
        return JwtHandler.getPayload<HeaderAuth>(this.getToken(request)).role;
    }

}