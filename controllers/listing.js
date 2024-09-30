const { response } = require("express");
const Listing = require("../models/listing");
const axios = require("axios"); // Import axios for HTTP requests
const mapToken = process.env.MAP_URL;
const NominatimAPI = process.env.NOMINATIM_API_URL; 
const userAgent = process.env.USER_AGENT; 

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm =  (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate:{
            path: "author",
    },
})
    .populate("owner");
    if (!listing) {
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings")
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    // Get the location from the listing details
    const location = req.body.listing.location; // Assuming location is included in req.body.listing

    try {
        // Geocoding the location
        const response = await axios.get(`${NominatimAPI}?q=${encodeURIComponent(location)}&format=json&limit=1`, {
            headers: {
                'User-Agent': userAgent, // Replace with your app name and website
            },
        });

        if (response.data.length > 0) {
            const geocodedData = response.data[0];
            newListing.geometry = {
                type: "Point",
                coordinates: [geocodedData.lon, geocodedData.lat], // Storing longitude and latitude
            };
        } else {
            console.log("Location not found!");
            req.flash("error", "Location not found!");
            return res.redirect("/listings/new");
        }
    } catch (error) {
        console.error("Error fetching geocoding data:", error);
        req.flash("error", "Error fetching location data.");
        return res.redirect("/listings/new");
    }
    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,  { ...req.body.listing });

    if (typeof req.file !== "undefined"){
        let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}