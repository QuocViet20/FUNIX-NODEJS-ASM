const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const redirectLinkSchema = new Schema({
  link: {
    type: String,
    require: true,
  },

  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
});

redirectLinkSchema.methods.updateLink = function (linkLogin) {
  this.link = linkLogin;
  return this.save();
};

module.exports = mongoose.model("redirectLink", redirectLinkSchema);
