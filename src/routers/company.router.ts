import { Router } from "express";
import { authenticate } from "../middleware/authentication.middleware";
import { companyController } from "../controllers/company.controller";
import { authorize } from "../middleware/authorization.middleware";
import multer from "multer";

export const companyRouter = Router();

/*
# routes: 

    1) [ POST ] => /register
    2) [ POST ] => /login
    3) [ GET, PUT ] => /profile
    4) [ POST ] => /agent
    5) [ GET ] => /agent
    6) [ DELETE ] => /agent/:id
    7) [ PUT ] => /agent/:id
    8) [ GET ] => /agent/:id
    9) [ PUT ] => /
*/

companyRouter.post("/register", companyController.register);

companyRouter.post("/login", companyController.login);

companyRouter.use(authenticate);

companyRouter.get("/profile/:id", companyController.getProfile);

companyRouter.use(authorize("company"));

companyRouter.route("/agent")
                            .post(companyController.create)
                            .get(companyController.getAll)

companyRouter.route("/agent/:id")
                                .delete(companyController.deleteAgent)
                                .put(companyController.updateAgent)
                                .get(companyController.getOne);

companyRouter.put("/", multer().single("image"), companyController.update)
