const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const apartmentSchema = new Schema(
  {
    apartmentName: {
      type: String,
      required: true,
      unique: true,
    },
    totalOfFloors: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apartment", apartmentSchema);
