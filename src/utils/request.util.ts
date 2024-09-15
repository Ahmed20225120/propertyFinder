import { Request } from "express";
import { JwtHandler } from "./jwtHandler.util";
import { HeaderAuth } from "../interfaces/header/header.interface";

export class RequestUtil
{
    public static hasBody(request: Request) : boolean
    {
        return !request.body || Object.keys(request.body).length === 0
    }

    public static hasQuery(request: Request) : boolean
    {
        return request.query && Object.keys(request.query).length > 0
    }


    public static getParamsByKey(request: Request, key: string) : string
    {
        return request.params.key;
    }

    public static getBodyByKey(request: Request, key: string) : string
    {
        return request.body.key;
    }

    public static hasHeaders(request: Request) : boolean
    {
        return request.headers && Object.keys(request.headers).length > 0
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