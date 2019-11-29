const express = require("express");

// const HttpError = require("../models/http-error");
const placesController = require("../controllers/places-controller");

const router = express.Router();

// const DUMMY_PLACES = [
//   {
//     id: "p1",
//     title: "Empire State Building",
//     description: "One of the most famous sky scrapers in the World!",
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516
//     },
//     address: "20 W 34th St, New York, NY 10001",
//     creator: "u1"
//   }
// ];

// router.get("/:pid", (req, res, next) => {
//   //   console.log("GET request received!");
//   const placeId = req.params.pid;
//   //   console.log(req.params);
//   const place = DUMMY_PLACES.find(p => p.id === placeId);

//   //   if (!place) {
//   //     return res.status(404).json({
//   //       message: "Could not find a place for the provided id."
//   //     });
//   //   }

//   //   if (!place) {
//   //     const error = new Error("Could not find a place for the provided id.");
//   //     error.code = 404;
//   //     throw error;
//   //   }

//   if (!place) {
//     throw new HttpError("Could not find a place for the provided id.", 404);
//   }

//   res.json({
//     place
//   });
// });

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlaceByUserId);

router.post("/", placesController.createPlace);

module.exports = router;
