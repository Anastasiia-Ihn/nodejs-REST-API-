import contactsService from "../models/contacts/index.js";

import { HttpError } from "../helpers/index.js";

import {
  contactAddSchema,
  contactUpdateSchema,
} from "../schemas/contact-schema.js";

const getAll = async (req, res, next) => {
  try {
    const result = await contactsService.listContacts();

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundContactById = await contactsService.getContactById(id);
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
    const result = await contactsService.addContact(req.body);
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

    const { id } = req.params;
    const result = await contactsService.updateContactById(id, req.body);
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
    const { id } = req.params;
    console.log(id);

    const result = await contactsService.removeContact(id);
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
  deleteById,
};
