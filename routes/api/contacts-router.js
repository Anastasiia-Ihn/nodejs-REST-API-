import express from "express";

import controllers from "../../controllers/contacts-controllers.js";

import {
  isEmptyBody,
  isValidId,
  isEmptyBodyFavorite,
} from "../../middlewares/index.js";

const contactsRouter = express.Router();

contactsRouter.get("/", controllers.getAll);

contactsRouter.get("/:id", isValidId, controllers.getById);

contactsRouter.post("/", isEmptyBody, controllers.add);

contactsRouter.put("/:id", isValidId, isEmptyBody, controllers.updateById);

contactsRouter.patch(
  "/:id/favorite",
  isValidId,
  isEmptyBodyFavorite,
  controllers.updateStatusContact
);

contactsRouter.delete("/:id", isValidId, controllers.deleteById);

export default contactsRouter;
