import express from "express"; 
import {json} from 'body-parser';
import cors from "cors";
import { config } from "dotenv";
import { userRouter } from "./src/routers/user.router";
import { companyRouter } from "./src/routers/company.router";
import { blogRouter } from "./src/routers/blog.router";
import { propertyRouter } from "./src/routers/property.router";
import { agentRouter } from "./src/routers/agent.router";
config();

const host : string = process.env.HOST ?? "localhost";
const port : number = (process.env.PORT as unknown as number) || 3000;

const app = express();

// middlewares 
app.use(express.json());
app.use(cors());

// routers 
app.use('/api/v1/user', userRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/property', propertyRouter);
app.use('/api/v1/agent', agentRouter);

app.listen(port, host, () => console.log(`Server running on http://${host}:${port}`))