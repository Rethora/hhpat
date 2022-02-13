const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;

validateUser = (req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            res.status(500).json({ message: err });
            return;
        }

        if (!user) {
            res.status(401).json({ message: "User not found!" });
            return;
        }

        if (user) {
            const passCheck = bcrypt.compareSync(req.body.password, user.password);
            if (!passCheck) {
                res.status(401).json({ message: "Incorrect password!" });
                return;
            } else if (passCheck) next();
        }
    });
};

checkLoggedIn = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return next();
    try {
        const data = jwt.verify(token, process.env.SECRET);
        req.userId = data.id;
        req.userRole = data.role;
        return res.status(200).send("already signed in");
    } catch {
        return next();
    }
};

const verifyLogin = { validateUser, checkLoggedIn };

module.exports = verifyLogin;