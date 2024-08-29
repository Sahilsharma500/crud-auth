const mongoose = require('mongoose');

const connectDB = async() =>{
   try{
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MONGODB Connected :  ${connection.connection.host}`)
   }catch(error){
    console.log("Error connecting to mongoDB: ", error.message);
   }
}

module.exports = connectDB;