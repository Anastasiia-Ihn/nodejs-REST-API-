import express from "express";

import authController from "../../controllers/auth-controllers.js";

import {
  authenticate,
  isEmptyBody,
  isEmptyFile,
  upload,
} from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, authController.signup);

authRouter.get("/verify/:verificationToken", authController.verify);

authRouter.post("/verify", isEmptyBody, authController.resendVerifyEmail);

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
  upload.single("avatar"),

  authenticate,
  isEmptyFile,
  authController.changeAvatar
);

export default authRouter;
