const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;

validateLogin = (req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            res.status(500).json({ message: "Something went wrong. Try again later." });
            return;
        }

        if (!user) {
            res.status(401).json({ message: "Incorrect username or password." });
            return;
        }

        if (user) {
            const passCheck = bcrypt.compareSync(req.body.password, user.password);
            if (!passCheck) {
                res.status(401).json({ message: "Incorrect username or password." });
                return;
            } else if (passCheck) next();
        }
    });
};

const verifyUser = { validateLogin };

module.exports = verifyUser;