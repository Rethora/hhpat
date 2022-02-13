const jwt = require("jsonwebtoken");
require("dotenv").config();

verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(403).redirect("/login");
    try {
        const data = jwt.verify(token, process.env.SECRET);
        req.userId = data.id;
        req.userRole = data.role;
        return next();
    } catch {
        return res.status(403).redirect("/login");
    }
};

isNotValidToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return next();
    try {
        const data = jwt.verify(token, process.env.SECRET);
        req.userId = data.id;
        req.userRole = data.role;
        return res.status(403).redirect("/home");
    } catch {
        return next();
    }
};

const authJwt = {
    verifyToken,
    isNotValidToken
};
module.exports = authJwt;