import { Router } from "express";
import { agentController } from "../controllers/agent.controller";
import { authenticate } from "../middleware/authentication.middleware";
export const agentRouter = Router();

agentRouter.post("/login", agentController.login);

agentRouter.use(authenticate);
agentRouter.get("/profile", agentController.view);