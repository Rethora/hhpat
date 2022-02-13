const db = require("../models");
const User = db.user;
const Client = db.client;
const Data = db.data;
require("dotenv").config();

const jwt = require("jsonwebtoken");

exports.isLoggedIn = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(200).send(false);
    try {
        const data = jwt.verify(token, process.env.SECRET);
        req.userId = data.id;
        req.userRole = data.role;
        return res.status(200).send(true);
    } catch {
        return res.status(200).send(false);
    }
}

exports.login = (req, res) => {

    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            res.status(500).json({ message: "An error occured!" });
            return;
        }

        if (!user) {
            res.status(400).json({ message: "An error occured!" });
            return;
        }

        if (user) {
            const token = jwt.sign({ id: user.id }, process.env.SECRET, {
                expiresIn: 43200 // 12 hours
            });
            return res
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production"
                })
                .status(200)
                .json({ success: "Logged in successfully!" })
        }
    });
};

exports.logout = (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .redirect("/login");
};

// responsible for checking if a client exists
exports.newEntryCheck = (req, res) => {
    const userId = req.userId;
    const { f_name, m_name, l_name } = req.query;

    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const existingClient = user.data.find(client => client.f_name === f_name && client.l_name === l_name);
            if (existingClient)
                return res.status(409).json({ conflict: "User with first and last name already exists in the database.", first: f_name, middle: m_name, last: l_name, id: existingClient._id });
            return res.status(200).json({ message: "No existing user. Good to go!" })
        }
    });
};

// responsible for creating a new client and entry
exports.newEntryCreate = (req, res) => {
    const userId = req.userId;
    const { f_name, m_name, l_name, ...rest } = req.body;
    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const data = new Data(rest);
            const client = new Client({
                f_name: f_name,
                m_name: m_name,
                l_name: l_name
            });
            client.values.push(data);
            user.data.push(client);
            user.save((err, done) => {
                if (err) console.error(err);
            });
            res.status(200).json({ message: "Successfully added client to database.", profileId: client._id, entryId: data._id });
        }
    })
};

exports.getAllProfiles = (req, res) => {
    const userId = req.userId;
    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            let arr = [];
            if (user.data.length) {
                user.data.forEach(u => {
                    let userObj = {
                        id: u._id,
                        first: u.f_name,
                        middle: u.m_name,
                        last: u.l_name
                    };
                    const lastEntry = u.values[u.values.length - 1];
                    if (lastEntry) userObj.lastUpdate = lastEntry.date;
                    arr.push(userObj);
                })
            }
            return res.status(200).json({ profiles: arr });
        }
    })
};

exports.getProfile = (req, res) => {
    const userId = req.userId;
    const clientId = req.query.id;
    if (!clientId) return res.status(404).json({ error: "No profile found." });
    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const client = user.data.find(c => c._id.toString() === clientId);
            if (client) return res.status(200).json({ client: client });
        }
        return res.status(404).json({ error: "No profile found." });
    })
};

exports.deleteEntry = (req, res) => {
    const userId = req.userId;
    const { profileId, entryId } = req.query;
    if (!profileId) return res.status(400).json({ error: "No profile id." });
    if (!entryId) return res.status(400).json({ error: "No entry id." });

    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const clientIdx = user.data.findIndex(c => c._id.toString() === profileId);
            if (clientIdx !== -1) {
                const client = user.data[clientIdx];
                const entryIdx = client.values.findIndex(e => e._id.toString() === entryId);
                if (entryIdx !== -1) {
                    client.values.splice(entryIdx, 1);
                    user.data.splice(clientIdx, 1, client);
                    user.save((err, done) => {
                        if (err) console.error(err);
                        return res.status(200).json({ success: "Successfully removed entry." });
                    })
                }
            }
        }
    })
};

exports.editEntry = (req, res) => {
    const userId = req.userId;
    const { profileId, entryId } = req.query;

    if (!profileId) return res.status(400).json({ error: "No profile id." });
    if (!entryId) return res.status(400).json({ error: "No entry id." });

    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const clientIdx = user.data.findIndex(c => c._id.toString() === profileId);
            if (clientIdx !== -1) {
                const client = user.data[clientIdx];
                const entryIdx = client.values.findIndex(e => e._id.toString() === entryId);
                if (entryIdx !== -1) {
                    const entry = client.values[entryIdx];
                    const { _id } = entry;
                    const data = new Data(req.body);
                    data._id = _id;
                    client.values.splice(entryIdx, 1, data);
                    user.data.splice(clientIdx, 1, client);
                    user.save((err, done) => {
                        if (err) console.error(err);
                        return res.status(200).json({ success: "Entry updated successfully." });
                    })
                }
            }
        }
    })
}

exports.deleteProfile = (req, res) => {
    const userId = req.userId;
    const { profileId } = req.query;
    if (!profileId) return res.status(400).json({ error: "No profile id." });
    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const dataIdx = user.data.findIndex(c => c._id.toString() === profileId);
            if (dataIdx !== -1) {
                user.data.splice(dataIdx, 1);
                user.save((err, done) => {
                    if (err) console.error(err);
                    return res.status(200).json({ message: "Successfully deleted profile." });
                })
            }
        }
    })
};

exports.addEntry = (req, res) => {
    const userId = req.userId;
    const { profileId } = req.query;
    if (!profileId) return res.status(400).json({ error: "No profile id." });
    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const dataIdx = user.data.findIndex(d => d._id.toString() === profileId);
            if (dataIdx !== -1) {
                const client = user.data[dataIdx];
                const data = new Data(req.body);
                client.values.push(data);
                user.data.splice(dataIdx, 1, client);
                user.save((err, done) => {
                    if (err) console.error(err);
                    return res.status(200).json({ message: "Successfully added entry to database.", entryId: data._id })
                })
            }
        }
    })
};

exports.getEntry = (req, res) => {
    const userId = req.userId;
    const { clientId, entryId } = req.query;
    if (!clientId) return res.status(400).json({ error: "No client id." });
    if (!entryId) return res.status(400).json({ error: "No entry id." });
    User.findById(userId, (err, user) => {
        if (err) console.error(err);
        if (user) {
            const client = user.data.find(c => c._id.toString() === clientId);
            if (client) {
                const entry = client.values.find(v => v._id.toString() === entryId);
                if (entry) {
                    entry.profileId = client._id;
                    entry.profileName = `${client.f_name} ${client.m_name} ${client.l_name}`;
                    return res.status(200).json({ entry: entry });
                }
            }
            return res.status(400).json({ error: "No entry found." })
        }
        return res.status(400).json({ error: "No user found." });
    })
};