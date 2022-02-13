const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "defaultSrc": ["'self'"],
            "scriptSrc": [
                "'self'",
                "unsafe-inline",
                "https://code.jquery.com/jquery-3.2.1.slim.min.js",
                "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js",
                "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
                "https://d3js.org/d3.v6.js",
                "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
            ]
        },
    })
);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// cookies
app.use(cookieParser());

// use css styles
app.use(express.static(path.join(__dirname + "/app/public")));

const db = require("./app/models");

db.mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connected to MongoDB.");
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// simple route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/app/public/pages/index.html'));
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});