const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({
    place
  });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter(p => p.creator === userId);

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided id.", 404)
    );
  }

  res.json({
    places
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

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({
    place: createdPlace
  });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, plese check your data", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const placeToUpdate = { ...DUMMY_PLACES.find(place => place.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId);
  placeToUpdate.title = title;
  placeToUpdate.description = description;
  DUMMY_PLACES[placeIndex] = placeToUpdate;

  res.status(200).json({ place: placeToUpdate });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError("Could not find a place for that id.", 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

  res.status(200).json({
    message: "Deleted place sucessfully"
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
