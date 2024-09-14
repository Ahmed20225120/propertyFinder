import jwt, { JwtPayload , JwtHeader} from "jsonwebtoken";
import { config } from "dotenv";
config();

export class JwtHandler 
{
    private static secret: string = process.env.JWT_SECRET ?? "secret";

    public static generateToken(payload: any): string
    {
        return jwt.sign(payload, this.secret, { expiresIn: "1d" });;
    }

    public static verifyToken(token: string): boolean
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

    private static decodeToken(token: string): JwtPayload | null
    {
        return jwt.decode(token, {json: true});
    }

    public static getPayload<T>(token: string):  T
    {
        return (this.decodeToken(token) as JwtPayload) as T;
    }
}