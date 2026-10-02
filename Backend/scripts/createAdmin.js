const dotenv = require("dotenv");
const mongoose = require("mongoose");

const User = require("../src/models/User");
const connectDB = require("../src/config/db");

dotenv.config();

const createAdmin = async () =>{
    try{
        await connectDB();
        // checking whether admin already exist or not
        const existingAdmin = await User.findOne({email: process.env.ADMIN_EMAIL});

        if(existingAdmin){
             throw new Error("Admin with this email already exists");
        }
        await User.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            phone: process.env.ADMIN_PHONE,
            role: "admin"
        });
         process.exitCode = 0;
    } catch(error){
        console.log("error in admin", error)
        process.exitCode = 1;
    }finally{
        await mongoose.connection.close();
    }
};

 createAdmin();