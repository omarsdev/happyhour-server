const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendSms } = require("../utils/twilioSMS");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    maxLength: 50,
  },
  last_name: {
    type: String,
    maxLength: 50,
  },
  phone_number: {
    type: String,
    maxLength: 14,
    unique: true,
  },
  email: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    maxLength: 20,
    required: true,
  },
  password: {
    type: String,
    maxLength: 255,
    select: false,
    minlenght: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
  },
  material_status: {
    type: String,
    enum: ["Single", "Married"],
  },
  date_of_marrage: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["user", "client", "brand_manager", "casher"],
    default: "user",
  },
  interestedBrand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
  ],
  interestedCategory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  resetPassword: String,
  resetPasswordExpire: Date,
  notificationToken: [
    {
      type: String,
    },
  ],
  photo: {
    type: String,
  },
  // verficationCode: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Verfication",
  //   },
  // ],
  // notification: {
  //   type: [
  //     {
  //       typeOfNotification: {
  //         type: String,
  //         enum: [
  //           "offer",
  //           "store",
  //           "gift",
  //           "interestedBrand",
  //           "convertPoints",
  //           "getPoints",
  //           "spentPoints",
  //         ],
  //       },
  //       refId: {
  //         type: mongoose.Schema.Types.ObjectId,
  //       },
  //       photoUrl: {
  //         type: String,
  //       },
  //       brandId: {
  //         type: String,
  //       },
  //       isCasher: {
  //         type: Boolean,
  //       },
  //       isSeen: {
  //         type: Boolean,
  //         default: false,
  //       },
  //       createdAt: {
  //         type: Date,
  //         default: Date.now,
  //       },
  //     },
  //   ],
  //   validate: [verficationLimit, "max Notification Limit is 50"],
  // },
  notification: {
    type: [
      {
        _id: false,
        typeOfNotification: {
          type: String,
          enum: [
            "offer",
            "store",
            "gift",
            "convertPoints",
            "getPoints",
            "spentPoints",
            "setCasher",
          ],
        },
        refId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        photoUrl: {
          type: String,
        },
        // brandId: {
        //   type: String,
        // },
        // brancheId: {
        //   type: String,
        // },
        // logo: {
        //   type: String,
        // },
        isCasher: {
          type: Boolean,
        },
        isSeen: {
          type: Boolean,
          default: false,
        },
        message: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    validate: [verficationLimit, "max Notification Limit is 50"],
  },

  notificationType: [
    {
      casher: {
        ref_brand: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
        },
        ref_branche: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branche",
        },
        brand_logo: {
          type: String,
        },
        message: {
          type: String,
        },
        isConfirm: {
          type: Boolean,
          default: false,
        },
        isSeen: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    },
  ],

  // paymentAccount: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "PaymentAccount",
  // },
  // notificationoff: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Brand",
  //   },
  // ],
  // pointsBrandSystem: [
  //   {
  //     _id: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Brand",
  //     },
  //     points: {
  //       type: Number,
  //     },
  //     cards: {
  //       type: Number,
  //       default: 0,
  //     },
  //     offersPointBrand: [
  //       {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: "Ads",
  //       },
  //     ],
  //     storePointsBrand: [
  //       {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: "Store",
  //       },
  //     ],
  //     verfication_ref: [
  //       {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: "Verfication",
  //       },
  //     ],
  //   },
  // ],

  HappyHourPointSystem: {
    points: {
      type: Number,
      default: 90,
    },
    card: {
      type: Number,
      default: 0,
    },
  },
  // notification: [{
  //   msg: {
  //     type: String,
  //     required: true,
  //   },
  //   title: {
  //     type: String,
  //     required: true,
  //   }
  // },
  // validate: ],
  country: {
    type: mongoose.Schema.ObjectId,
    ref: "Country",
  },
  city: {
    type: mongoose.Schema.ObjectId,
    ref: "City",
  },
  street: {
    type: mongoose.Schema.ObjectId,
    ref: "Street",
  },
  historySearch: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    validate: [arrayLimit, "max discount is 10"],
  },
});

//Encypt password using Bycrpt

UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

///Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Match User Entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

function arrayLimit(val) {
  return val.length <= 10;
}

function verficationLimit(val) {
  return val.length <= 50;
}

module.exports = mongoose.model("User", UserSchema);
