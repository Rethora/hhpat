const mongoose = require("mongoose");

const Data = mongoose.model(
    "data",
    new mongoose.Schema({
        date: { type: Date, default: Date.now, required: true },
        weight: { type: Number },
        bld_pres: { type: String },
        rmr: { type: Number },
        fat: { type: Number },
        muscle: { type: Number },
        chol: { type: Number },
        ldl: { type: Number },
        hdl: { type: Number },
        trig: { type: Number },
        bld_glu: { type: Number },
        vo2: { type: Number },
        sleep: { type: Number },
        stress: { type: Number },
        notes: { type: String }
    })
);

module.exports = Data;