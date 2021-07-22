const mongoose = require("mongoose");

//Client Category

const CategorySchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: true,
  },
  name_ar: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // hasParent: {
  //   type: Date,
  //   required: true
  // },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null,
  },
  hasSize: [
    {
      type: String,
    },
  ],
  // offer_types_role: {
  //   type: String,
  //   enum: ["store", "custom", "store_or_custom"],
  //   required: true,
  // },
  // gift_type_role: {
  //   type: String,
  //   enum: ["store", "custom", "store_or_custom"],
  //   required: true,
  // }
});

const Category = mongoose.model("Category", CategorySchema);

//Sub-classification for Category

const subClassificationsSchema = new mongoose.Schema({
  name_en: {
    type: String,
  },
  name_ar: {
    type: String,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sub = mongoose.model("SubClassifications", subClassificationsSchema);

module.exports = {
  Category,
  Sub,
};
