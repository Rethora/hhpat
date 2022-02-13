const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/login", [authJwt.isNotValidToken], controller.allAccess);

    app.get("/dashboard", [authJwt.verifyToken], controller.userBoard);

    app.get("/new", [authJwt.verifyToken], controller.userBoard);

    app.get("/profiles", [authJwt.verifyToken], controller.userBoard);

    app.get("/profile", [authJwt.verifyToken], controller.showProfilePage);

    app.get("/add", [authJwt.verifyToken], controller.showAddEntryPage);

    app.get("/view", [authJwt.verifyToken], controller.showEntryViewPage);

    app.get("/edit", [authJwt.verifyToken], controller.showEditPage);

};