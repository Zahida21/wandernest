const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

//create and index route 
router
.route("/")
.get(wrapAsync(listingController.index)
)
.post(
    isLoggedIn,
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing)
);

// New Route (Form for creating new listing)
router.get("/new", isLoggedIn,listingController.renderNewForm);

// show, update and delete route
router
.route("/:id")
.get(wrapAsync(listingController.showListing)
)
.put(
    isLoggedIn,
    isOwner, 
    upload.single('listing[image]'),
    validateListing,
     wrapAsync(listingController.updateListing)
)
.delete(
    isLoggedIn,
    isOwner, 
    wrapAsync(listingController.destroyListing)
);

// Edit Route (Form to edit a listing)
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,  
    wrapAsync(listingController.renderEditForm)
);

// New Route for filtering listings by category
router.get("/filter", wrapAsync(async (req, res) => {
    const { category } = req.query; // Get the category from query parameters
    try {
      let filteredListings;
      if (category) {
        // Find listings by category
        filteredListings = await Listing.find({ category });
      } else {
        // If no category is specified, return all listings
        filteredListings = await Listing.find();
      }
      res.json(filteredListings); // Return the filtered listings as JSON
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }));

module.exports = router;