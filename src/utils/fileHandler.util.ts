import fs from 'fs/promises';

export class FileHandler
{

    private static async writeFileSYNC(path: string, data: string): Promise<boolean>
    {
        try
        {
            await fs.writeFile(path, data);
            return true;
        }
        catch (error: any)
        {
            console.log(error.message);
        }
        return false;
    }

    public static writeFile(path: string, data: string): boolean
    {
        let dataToReturn : boolean = false;
        
        FileHandler.writeFileSYNC(path, data).then(data => dataToReturn = data);

        return dataToReturn;
    }    
    
    private static async readFileSYNC(path: string): Promise<string>
    {
        try
        {
            const data = await fs.readFile(path, 'utf-8');
            return data;
        }
        catch (error: any)
        {
            console.log(error.message);
        }
        return '';
    }

    public static readFile(path: string): string
    {
        let dataToReturn : string = ''; 

        FileHandler.readFileSYNC(path).then(data => dataToReturn = data);

        return dataToReturn;
    }

    
    public static deleteFile(path: string): boolean
    {
        try
        {
            fs.unlink(path);
            return true;
        }
        catch (error: any)
        {
            console.log(error.message);
        }
        return false;
    }
}