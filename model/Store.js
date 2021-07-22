const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxLength: 100,
  },
  iwantthis: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  happy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  verficationCode: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VerficationStore",
    },
  ],
  priceInCard: {
    type: Number,
    required: true,
  },
  priceInPoints: {
    type: Number,
    required: true,
  },
  isConfirm: {
    type: Boolean,
    default: false,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  itemType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  // color: [
  //   {
  //     type: {
  //       type: String,
  //       defaut: null,
  //     },
  //     photo: {
  //       photoarray: {
  //         type: [
  //           {
  //             type: String,
  //             required: true,
  //           },
  //         ],
  //         validate: [arrayLimit, "max size is 3"],
  //       },
  //       size: [
  //         {
  //           type: String,
  //           required: true,
  //         },
  //       ],
  //     },
  //   },
  // ],
  product: [
    {
      color: {
        type: String,
      },
      photo: {
        type: [
          {
            type: String,
            required: true,
          },
        ],
        validate: [arrayLimit, "max photo for each color is 3"],
      },
      size: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  Rate: [
    {
      user_ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        maxlength: 250,
        required: true,
      },
      rate: {
        type: Number,
        required: true,
      },
      created_at: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  rateAvg: {
    type: Number,
    default: 0,
  },
});

function arrayLimit(val) {
  return val.length <= 3;
}
module.exports = mongoose.model("Store", StoreSchema);
