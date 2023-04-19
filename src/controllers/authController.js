import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import jwt from 'jsonwebtoken';

import { User } from '../models/index.js';

const { sign } = jwt;

const __dirname = dirname(fileURLToPath(import.meta.url));

const handleErrors = err => {
  const errObj = {};

  if (err.message === 'Incorrect email') {
    errObj.email = ' That email is not registered';
  }

  if (err.message === 'Incorrect password') {
    errObj.password = 'Incorrect password';
  }

  if (err.message.includes('unique') && err.parent.code === '23505') {
    errObj.email = 'The email you provided is already registered.';
    return errObj;
  }

  if (err.message.includes('Validation')) {
    err.errors.forEach(error => {
      errObj[error.path] = error.message;
    });
  }

  return errObj;
};

const maxAge = 3 * 24 * 60 * 60; // days * hours * minutes ....

const createToken = id => {
  return sign({ id }, process.env.ACCESS_SECRET_KEY, { expiresIn: maxAge });
};

export const getSignUp = async (req, res, next) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
};

export const getLogin = async (req, res, next) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
};

export const postSignUp = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await User.create({ firstName, lastName, email, password });
    const token = createToken(user.id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user.id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors: errors });
  }
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user.id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user.id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors: errors });
  }
};

export const getLogOut = async (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.status(201).json({ message: 'Logged out.' });
};
