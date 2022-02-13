const path = require("path");

exports.showEditPage = (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, "/../public/pages/edit.html"));
};

exports.showProfilePage = (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, "/../public/pages/profile.html"));
};

exports.showAddEntryPage = (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, "/../public/pages/add.html"));
};

exports.showEntryViewPage = (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, "/../public/pages/entry.html"));
}

exports.allAccess = (req, res) => {
    if (req.route.path === "/login") {
        res.status(200).sendFile(path.join(__dirname + '/../public/pages/login.html'));
    }
};

exports.userBoard = (req, res) => {
    if (req.route.path === "/dashboard") {
        return res.status(200).sendFile(path.join(__dirname, "/../public/pages/dashboard.html"));
    }
    if (req.route.path === "/new") {
        return res.status(200).sendFile(path.join(__dirname, "/../public/pages/new.html"));
    }
    if (req.route.path === "/profiles") {
        return res.status(200).sendFile(path.join(__dirname, "/../public/pages/profiles.html"));
    }
};