const mongoose = require("mongoose");

const PointSystemUser = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
})