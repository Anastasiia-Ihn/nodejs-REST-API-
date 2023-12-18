import express from "express";

import controllers from "../../controllers/contacts-controllers.js";

import { isEmptyBody } from "../../middlewares/index.js";

const contactsRouter = express.Router();

contactsRouter.get("/", controllers.getAll);

contactsRouter.get("/:id", controllers.getById);

contactsRouter.post("/", isEmptyBody, controllers.add);

contactsRouter.put("/:id", isEmptyBody, controllers.updateById);

contactsRouter.delete("/:id", controllers.deleteById);

export default contactsRouter;
