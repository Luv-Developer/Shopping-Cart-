const mongoose = require("mongoose")
const connection = mongoose.connect("mongodb://0.0.0.0/Shopping-Cart").then(()=>{
    console.log("Database Connected")
})
module.exports = connection