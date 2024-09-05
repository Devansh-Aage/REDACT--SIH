const mongoose = require("mongoose");
const { Schema } = mongoose;

const FileSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  filename:{
    type:String,
    required:true
  },
  encryptionkey: {
    type: Buffer,
    required: true,
  },
  ipfsCID: {
    type: String,
    required: true,
  },
  mimeType:{
    type:String,
    required:true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
const File = mongoose.model("file", FileSchema);

module.exports = File;
