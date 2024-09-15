import { Router } from "express";
import { authenticate } from "../middleware/authentication.middleware";
import { userController } from "../controllers/user.controller";

export const userRouter = Router();

/*
# routes: 

    1) [ POST ] => /register
    2) [ POST ] => /login
    3) [ GET, PUT ] => /profile
    4) [ POST ] => /save/:id
    5) [ DELETE ] => /unsave/:id
    6) [ POST ] => /mailAgent/:id
*/

userRouter.post("/register", userController.register);

userRouter.post("/login", userController.login);

userRouter.use(authenticate);

userRouter.route("/profile")
                            .get(userController.view)
                            .put(userController.update);

userRouter.post("/save/:id", userController.save);

userRouter.delete("/unsave/:id", userController.unsave);

userRouter.post("/mailAgent", userController.mailAgent);

