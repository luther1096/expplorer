const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    "mongodb+srv://luther:5oKDeazLkWCpaORV@cluster0-grl0u.mongodb.net/expplore?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("Server listening on port 5000.....");
    });
    console.log("DB Connection successful...");
  })
  .catch(() => {
    console.log("DB Connection failed");
  });
