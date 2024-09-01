require('dotenv').config()
const mongoose = require('mongoose');
const mongoURI=process.env.MONGO_URI


const connectToMongo=async()=>{
    mongoose.connect(mongoURI)
    .then(()=>{console.log("success")})
    .catch((err)=>{console.log(err)});
}

module.exports=connectToMongo;