import { Router } from "express";
import { authenticate } from "../middleware/authentication.middleware";
import { authorize } from "../middleware/authorization.middleware";
import { blogController } from "../controllers/blog.controller";
import multer from "multer";

export const blogRouter = Router();

/*
# routes:

    1) [ GET ] => /
    2) [ POST ] => /
    3) [ DELETE ] => /:id
    4) [ PUT ] => /:id     -----     //under development
    5) [ GET ] => /:id
    
*/

blogRouter.get('/', blogController.getAll);
blogRouter.get('/:id', blogController.getOne);

blogRouter.use(authenticate);   
blogRouter.use(authorize("company","agent"));

blogRouter.post('/', multer().array('images'),blogController.create);

blogRouter.route("/:id")
                        .delete(blogController.deleteBlog);
                        // .put(blogController.update);