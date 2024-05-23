import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";

import { HttpError, sendEmail } from "../helpers/index.js";

import User, {
  userSigninSchema,
  subscriptionSchema,
  userSignupSchema,
  userEmailSchema,
} from "../models/User.js";

import { ctrlWrapper } from "../decorators/index.js";

const avatarPath = path.resolve("public", "avatars");

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const validateResult = userSignupSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click here</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res) => {
  const validateResult = userEmailSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click here</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
};

const signin = async (req, res) => {
  const validateResult = userSigninSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verify");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;
  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { subscription, email } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({
    message: "No Content",
  });
};
const changeSubscription = async (req, res) => {
  const validateResult = subscriptionSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }
  const { _id } = req.user;

  const result = await User.findOneAndUpdate(_id, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, `Contact id:${id} not found`);
  }
  res.json(result);
};

const changeAvatar = async (req, res) => {
  const { _id, email } = req.user;

  const { path: oldPath, originalname } = req.file;

  const uniquePreffix = `${Math.round(Date.now() * Math.random())}`;

  const filename = `${uniquePreffix}_${originalname}`;

  const newPath = path.join(avatarPath, filename);

  const avatarURL = path.join("avatars", filename);

  Jimp.read(oldPath).then((file) => {
    file.resize(250, 250).write(newPath);
  });

  await fs.rename(oldPath, newPath);

  const result = await User.findByIdAndUpdate(
    _id,
    { avatarURL },
    { new: true }
  );

  if (!result) {
    throw HttpError(401, `Not authorized`);
  }
  res.json({ avatarURL });
};
export default {
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  changeSubscription: ctrlWrapper(changeSubscription),
  changeAvatar: ctrlWrapper(changeAvatar),
};
