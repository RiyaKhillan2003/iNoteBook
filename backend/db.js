const mongoose = require("mongoose");
require("dotenv").config();
const mongoURL=process.env.MONGOURL;

const connectToMongo = ()=>{
    mongoose.connect(mongoURL)
    .then(()=>{
        console.log("Connection Successfull")
    })
    .catch(err => {
        console.log("Connection Failed");
    })
}

module.exports = connectToMongo;