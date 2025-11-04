const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const residentSchema = new Schema(
  {
    residentName: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9\s\/]+$/, // Allow a-z, A-Z, /, space
    },
    residentDescription: {
      type: String,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
      min: 1,
      max: 40,
    },
    yOB: {
      type: Number,
      required: true,
      min: 1940,
      max: 2025,
    },
    isOwned: {
      type: Boolean,
      default: false,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resident", residentSchema);
