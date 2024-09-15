const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrgSchema = new Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    required: true,
  },
  admin: [{ type: Schema.Types.ObjectId, ref: "user" }],
  employee: [{ type: Schema.Types.ObjectId, ref: "user" }],
});

const Org = mongoose.model("org", OrgSchema);

module.exports = Org;
