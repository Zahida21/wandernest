const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review= require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController =  require("../controllers/review.js");


//Post review route also validating review
router.post("/",
 isLoggedIn,
 validateReview, 
 wrapAsync(reviewController.createReview)
);

//Delete review route

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
   wrapAsync(reviewController.destroyReview)
);

module.exports = router;