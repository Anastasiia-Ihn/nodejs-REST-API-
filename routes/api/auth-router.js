import express from "express";

import authController from "../../controllers/auth-controllers.js";

import { isEmptyBody, isValidId } from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post("/signup", isEmptyBody, authController.signup);

authRouter.post("/signin", isEmptyBody, authController.siingn);

export default authRouter;
