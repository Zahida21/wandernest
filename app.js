if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStartegy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

  
const dbUrl = process.env.ATLASDB_URL;

// Connect to MongoDB
main().then(()=>{
  console.log('connected to DB');
  
}).catch(err=>{
  console.log(err);
})

async function main() {
 await mongoose.connect(dbUrl);
}

// Middleware Setup
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));  // To parse form data
app.use(methodOverride("_method"));  // To support PUT and DELETE methods
app.use(express.static(path.join(__dirname, "/public")));  // Static files


const sessionOptions = {
  secret : process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now()+1000*60*60*24*7,
    maxAge: 1000*60*60*24*7,
    httpOnly:true
  },
};


const store =MongoStore.create({ 
  mongoUrl: dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24* 3600,

 });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStartegy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async (req,res)=>{
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"student21"
//   });

//   let registeredUser= await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);

// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)


// Catch-All Route for Unhandled Pages (404)
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500,message="something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message});  
});

// Start Server
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
