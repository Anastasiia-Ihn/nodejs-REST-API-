import express from "express";

import authController from "../../controllers/auth-controllers.js";

import {
  authenticate,
  isEmptyBody,
  isValidId,
  upload,
} from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("avatar"),
  isEmptyBody,
  authController.signup
);

authRouter.post("/login", isEmptyBody, authController.signin);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.logout);

authRouter.patch(
  "/",
  authenticate,
  isEmptyBody,
  authController.changeSubscription
);

authRouter.patch(
  "/avatars",
  authenticate,
  isEmptyBody,
  authController.changeAvatar
);

export default authRouter;
