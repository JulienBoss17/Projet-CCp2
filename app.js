const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const ejs = require("ejs")
const bcrypt = require("bcrypt");
const session = require('express-session');
const methodOverride = require("method-override");
const MongoStore = require('connect-mongo');

//set up session
const app = express();
app.set("view engine", "ejs");
app.set("views", "./VIEWS/PAGES");
app.use(express.static("PUBLIC"));
app.use(session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    }
  }));
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

//Middleware
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
const homeRouter = require("./ROUTES/homeRouter");
app.use(homeRouter);

// Connect to DB

mongoose.connect(process.env.MONGO_URI, {  
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000 
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.error("❌ Erreur de connexion MongoDB :", err));


const port= process.env.PORT || 3040;

app.listen(port,() => {
    console.log("listening http://localhost:"+ port)
})