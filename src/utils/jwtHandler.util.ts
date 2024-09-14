import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export class JwtHandler 
{
    private static secret: string = process.env.JWT_SECRET ?? "secret";

    public static GenerateToken(payload: any): string
    {
        return jwt.sign(payload, this.secret, { expiresIn: "1d" });;
    }

    public static VerifyToken(token: string): any
    {
        
        try
        {
            jwt.verify(token, this.secret);
            return true;
        }
        catch(error: any)
        {
            console.log(error.message);
        }
        return false;
    }

    private static DecodeToken(token: string): any
    {
        return jwt.decode(token, {json: true});
    }

    public static getPayload(token: string): any
    {
        return this.DecodeToken(token).payload;
    }
}