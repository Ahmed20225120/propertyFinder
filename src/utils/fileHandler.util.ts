import fs from 'fs';

export class FileHandler
{

    public static writeFile(path: string, data: Buffer): void
    {   
        fs.writeFileSync(path, data);
    }    
    
    

    public static  readFile(path: string): string
    {
        let dataToReturn : string = ''; 

        dataToReturn = fs.readFileSync(path, 'utf-8');

        return dataToReturn;
    }

    
    public static deleteFile(path: string): boolean
    {
        try
        {
            fs.unlinkSync(path);
            return true;
        }
        catch (error: any)
        {
            console.log(error.message);
        }
        return false;
    }
}