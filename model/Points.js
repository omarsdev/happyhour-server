const mongoose = require("mongoose");

const PointsSchema = new mongoose.Schema({
  brandid: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
      userref: [
        {
          userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          points: {
            type: Number,
          },
          gift_ref: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Gift",
            },
          ],
          ads_ref: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Ads",
            },
          ],
          store_ref: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Store",
            },
          ],
        },
      ],
    },
  ],
});
