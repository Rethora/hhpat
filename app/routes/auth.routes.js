const { authJwt, verifyUser } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // POST routes
    app.post("/api/auth/login", [verifyUser.validateLogin], controller.login);

    app.post("/api/auth/add", [authJwt.verifyToken], controller.addEntry);

    app.post("/api/auth/new/create", [authJwt.verifyToken], controller.newEntryCreate);

    app.post("/api/auth/entry/edit", [authJwt.verifyToken], controller.editEntry);

    // GET ROUTES
    app.get("/api/auth/new/check", [authJwt.verifyToken], controller.newEntryCheck);

    app.get("/api/auth/profiles", [authJwt.verifyToken], controller.getAllProfiles);

    app.get("/api/auth/get/profile", [authJwt.verifyToken], controller.getProfile);

    app.get("/api/auth/delete/entry", [authJwt.verifyToken], controller.deleteEntry);

    app.get("/api/auth/delete/profile", [authJwt.verifyToken], controller.deleteProfile);

    app.get("/api/auth/logout", [authJwt.verifyToken], controller.logout);

    app.get("/api/auth/loggedin", controller.isLoggedIn);

    app.get("/api/auth/get/entry", [authJwt.verifyToken], controller.getEntry);
};