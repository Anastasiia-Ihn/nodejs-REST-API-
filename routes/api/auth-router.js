import express from "express";

import authController from "../../controllers/auth-controllers.js";

import {
  authenticate,
  isEmptyBody,
  isValidId,
} from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post("/signup", isEmptyBody, authController.signup);

authRouter.post("/signin", isEmptyBody, authController.signin);

authRouter.get("/users/current", authenticate, authController.getCurrent);

authRouter.post("/users/logout", authenticate, authController.logout);

export default authRouter;
