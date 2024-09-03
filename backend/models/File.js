const mongoose = require("mongoose");
const { Schema } = mongoose;

const FileSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    filename: {
        type: String,
        required: true
    },
    encyptionkey: {
        type: String,
        required: true,
        unique: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }

});
const File = mongoose.model('file', FileSchema);

module.exports = File;