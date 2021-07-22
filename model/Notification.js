const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  context: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        enum: ["user", "client", "brand_manager", "branche_manager", "casher"],
      },
      title: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Notification", NotificationSchema);
