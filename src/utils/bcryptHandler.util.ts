import bcrypt from "bcrypt";

export class BcryptHandler
{
    public static HashPassword(password: string): string
    {
        return bcrypt.hashSync(password, 10);
    }

    public static ComparePassword(password: string, hash: string): boolean
    {
        return bcrypt.compareSync(password, hash);
    }
}