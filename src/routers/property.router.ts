import { Router } from "express";
import { authenticate } from "../middleware/authentication.middleware";
import { authorize } from "../middleware/authorization.middleware";
import { propertyController } from "../controllers/property.controller";
import multer from "multer";

export const propertyRouter = Router();

/*
# routes:

    1) [ GET ] => /
    2) [ POST ] => /
    3) [ DELETE ] => /:id
    4) [ PUT ] => /:id     -----     //under development
    5) [ GET ] => /:id
    
*/

propertyRouter.get('/rent',  propertyController.getRent);
propertyRouter.get('/buy', propertyController.getBuy);

propertyRouter.post('/rent/:id', authenticate, propertyController.rentProperty);
propertyRouter.post('/buy/:id', authenticate,propertyController.buyProperty);

propertyRouter.get('/', propertyController.getAll);
propertyRouter.get('/:id', propertyController.getOne);

propertyRouter.use(authenticate);   
propertyRouter.use(authorize("company","agent"));

propertyRouter.post('/', multer().array('images'),propertyController.create);

propertyRouter.route("/:id")
                            .put(propertyController.update)
                            .delete(propertyController.deleteProperty);