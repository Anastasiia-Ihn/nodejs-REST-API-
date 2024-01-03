import Contact from "../models/Contact.js";

import { HttpError } from "../helpers/index.js";

import {
  contactAddSchema,
  contactUpdateSchema,
  contactUpdateFavoriteSchema,
} from "../models/Contact.js";

const getAll = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20, favorite = null } = req.query;
    const skip = (page - 1) * limit;
    const filter = { owner };
    if (favorite || favorite === false) {
      filter.favorite = favorite;
    }
    const result = await Contact.find(filter, "-createdAt -updatedAt", {
      skip,
      limit,
    }).populate("owner", "email subscription");
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const { _id: owner } = req.user;

    const foundContactById = await Contact.findOne({ _id, owner });
    if (!foundContactById) {
      throw HttpError(404, `Contact with id=${id} not found`);
    }
    res.json(foundContactById);
  } catch (error) {
    next(error);
  }
};

const add = async (req, res, next) => {
  try {
    const validateResult = contactAddSchema.validate(req.body);

    if (validateResult.error) {
      throw HttpError(400, validateResult.error.message);
    }
    const { _id: owner } = req.user;
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req, res, next) => {
  try {
    const validateResult = contactUpdateSchema.validate(req.body);

    if (validateResult.error) {
      throw HttpError(400, validateResult.error.message);
    }
    const { _id: owner } = req.user;

    const { id: _id } = req.params;
    const result = await Contact.findOneAndUpdate({ _id, owner }, req.body, {
      new: true,
    });
    if (!result) {
      throw HttpError(404, `Contact id:${id} not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const validateResult = contactUpdateFavoriteSchema.validate(req.body);

    if (validateResult.error) {
      throw HttpError(400, validateResult.error.message);
    }

    const { _id: owner } = req.user;

    const { id: _id } = req.params;

    const result = await Contact.findOneAndUpdate({ _id, owner }, req.body, {
      new: true,
    });
    if (!result) {
      throw HttpError(404, `Contact id:${id} not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteById = async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const { _id: owner } = req.user;

    const result = await Contact.findOneAndDelete({ _id, owner });
    if (!result) {
      throw HttpError(404, `Contact id:${id} not found`);
    }
    res.json({
      message: "Contact deleted",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  add,
  updateById,
  updateStatusContact,
  deleteById,
};
