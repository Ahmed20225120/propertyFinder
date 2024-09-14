import express from "express"; 
import {json} from 'body-parser';
import cors from "cors";
import { config } from "dotenv";
config();

const host : string = process.env.HOST ?? "localhost";
const port : number = (process.env.PORT as unknown as number) || 3000;

const app = express();

// middlewares 
app.use(json());
app.use(cors());

// routers 



app.listen(port, host, () => console.log(`Server running on http://${host}:${port}`))