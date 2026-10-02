const User  = require("../models/User");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
    try{
        const{name,email,password,phone} = req.body;
        
        if(!name || !email || !password){
            return res.status(400).json({
                success :false,
                message : "Name,Email,Password are required",
                data : null
            });
        }
            //if user exists already 
        const existingUser  = await User.findOne({email});
        if(existingUser){
            return res.status(409).json({
                success : false,
                message : "User with this email already exists",
                data : null
            })
        }

        //creating user
        const user = await User.create({
            name,
            email,
            password,
            phone
        });
        return res.status(201).json({
            success : true,
            message: "User register successfully.",
            data:{
                id :user._id,
                name : user.name,
                email :user.email,
                phone : user.phone,
                role : user.role,
                isActive : user.isActive,
                createdAt : user.createdAt
            }
        });


    } catch(error){
         console.error("Register Error:", error);
        return res.status(500).json({
            success :false,
            message : "Failed to register User",
            data :null 
        });
    }
};


const loginUser = async (req, res)=>{
    try{
        const {email,password} = req.body;
        //validate requires fields
        if(!email || !password){
            return res.status(400).json({
                success :false,
                message : "Email and Password are requires",
                data : null
            })
        }
        //finding user
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success :false,
                message : "Invalid Email or Password",
                data :null
            });
        }
        //checking if user is active
        if(!user.isActive){
            return res.status(403).json({
                success : false,
                message : "Your Account is Deactivated",
                data : null
            });
        }

        //comparing passowrd
        const isPasswordCorrect = await user.comparePassword(password)
        if(!isPasswordCorrect){
            return res.status(401).json({
                success:false,
                message : "Invalid password",
                data : null
            });
        }

        //generating JWT
        const token  =  jwt.sign(
            {
                userId : user._id,
                role : user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn  : "1d"
            }
        );

        return res.status(200).json({
            success :true,
            message : "Login successful",
            data : {
                token,
                user : {
                    id : user._id,
                    name : user.name,
                    email : user.email,
                    phone : user.phone,
                    role : user.role,
                    isActive : user.isActive
                }
            }
        });

    } catch (error){
        console.error("login error", error);
        return res.status(500).json({
            success:false,
            message : "Failed to login User",
            data :null 
        })
    }
}


module.exports={
    registerUser,
    loginUser
}