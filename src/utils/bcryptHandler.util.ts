import bcrypt from "bcrypt";

export class BcryptHandler
{
    public static hashPassword(password: string): string
    {

        try
        {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        }
        catch(error: any)
        {
            console.log(error.message);
        }

        return "";
    }

    public static comparePassword(password: string, hash: string): boolean
    {
        return bcrypt.compareSync(password, hash);
    }
}