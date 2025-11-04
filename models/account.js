const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const accountSchema = new Schema(
  {
    us: {
      type: String,
      required: true,
      unique: true,
    },
    pw: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

accountSchema.pre("save", async function (next) {
  if (!this.isModified("pw")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.pw = await bcrypt.hash(this.pw, salt);
    next();
  } catch (error) {
    next(error);
  }
});
accountSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.pw);
};

module.exports = mongoose.model("Account", accountSchema);
