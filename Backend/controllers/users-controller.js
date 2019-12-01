const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const User = require("../models/user");

let DUMMY_USERS = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@gmail.com",
    password: "123456"
  }
];

const getUsers = async (req, res, next) => {
  let allUsers;

  try {
    allUsers = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Something went wrong, please try again.", 500));
  }

  res.status(200).json({
    users: allUsers.map(user => user.toObject({ getters: true }))
  });

  // res.status(200).json({
  //   users: DUMMY_USERS
  // });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, plese check your data", 422);
  }

  const { name, email, password } = req.body;

  let existingUser;
  let newUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Sign up failed, Please try again.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User exists laready, please login instead.", 422)
    );
  }

  try {
    newUser = await User({
      name,
      email,
      password,
      image: "https://source.unsplash.com/random?human",
      places: []
    });
    newUser.save();
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  // DUMMY_USERS.push(newUser);

  res.status(201).json({
    user: newUser.toObject({ getters: true })
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // const hasUser = DUMMY_USERS.find(u => u.email === email);
  // if (hasUser) {
  //   throw new HttpError("Could not create user, email already exists.", 422); // 422 - Invalid user input
  // }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Logging in failed, Please try again.", 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(
      new HttpError("Invalid email or password, could not log you in.", 401)
    );
  }

  // const identifiedUser = DUMMY_USERS.find(user => user.email === email);

  // if (!identifiedUser || identifiedUser.password !== password) {
  //   throw new HttpError(
  //     "Could not idenityfy user, credentials seem to be wrong.",
  //     401
  //   ); // 401 - authentication failed
  // }

  res.status(200).json({
    message: "Logged In!"
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
