const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");

let DUMMY_USERS = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@gmail.com",
    password: "123456"
  }
];

const getUsers = (req, res, next) => {
  res.status(200).json({
    users: DUMMY_USERS
  });
};

const signup = (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: uuid(),
    name,
    email,
    password
  };

  DUMMY_USERS.push(newUser);

  res.status(201).json({
    user: newUser
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const hasUser = DUMMY_USERS.find(u => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists.", 422); // 422 - Invalid user input
  }

  const identifiedUser = DUMMY_USERS.find(user => user.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not idenityfy user, credentials seem to be wrong.",
      401
    ); // 401 - authentication failed
  }

  res.status(200).json({
    message: "Logged In!"
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
