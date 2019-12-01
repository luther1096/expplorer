const mongoose = require("mongoose");
const uuid = require("uuid/v4");

const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");

const Place = require("../models/place");
const User = require("../models/user");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the World!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1"
  }
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  // const place = DUMMY_PLACES.find(p => p.id === placeId);

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong... Please try again.",
      500
    );
    return next(error);
  }

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({
    place: place.toObject({ getters: true })
  });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // const places = DUMMY_PLACES.filter(p => p.creator === userId);
  // let places;
  // try {
  //   places = await Place.find({ creator: userId });
  // } catch (err) {
  //   return next(new HttpError("Fetching places failed, please try again", 500));
  // }

  // Alternative
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    return next(new HttpError("Fetching places failed, please try again", 500));
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, plese check your data", 422)
    );
  }
  const { title, description, address, creator } = req.body;

  const coordinates = getCoordsForAddress(address);

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "https://source.unsplash.com/random?sky_scraper",
    creator
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not user for the provided Id", 404));
  }

  // console.log(user);

  // DUMMY_PLACES.push(createdPlace);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, Please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    place: createdPlace
  });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, plese check your data", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  // const placeToUpdate = { ...DUMMY_PLACES.find(place => place.id === placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId);
  // placeToUpdate.title = title;
  // placeToUpdate.description = description;
  // DUMMY_PLACES[placeIndex] = placeToUpdate;
  let placeToUpdate;
  try {
    placeToUpdate = await Place.findById(placeId);
    placeToUpdate.title = title;
    placeToUpdate.description = description;
    placeToUpdate.save();
  } catch (err) {
    return next(
      new HttpError("Operation could not be performed, pLease try again.", 500)
    );
  }

  res.status(200).json({ place: placeToUpdate.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  // if (!DUMMY_PLACES.find(p => p.id === placeId)) {
  //   throw new HttpError("Could not find a place for that id.", 404);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Could not delete place. Please try again."));
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Somthing went wrong, could not delete place."));
  }

  res.status(200).json({
    message: "Deleted place sucessfully"
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
