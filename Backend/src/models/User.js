const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required :[ true, "Name is required"],
            trim : true,
            minlength : [2, "Name must be atleast 2 character long"],
            maxlength :[60,"Name cannot exceed 50 characters"]
        },
                email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"]
        },

        phone: {
            type: String,
            trim: true
        },

        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient"
        },

        isActive: {
            type: Boolean,
            default: true
        },  
    },
    {
        timestamps :true
    }
)
//hashing of passoword before saving
userSchema.pre("save", async function (){
            if(!this.isModified("password")){
                return ;
            }
            this.password = await bcrypt.hash(this.password, 12);
            
})


userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(
        candidatePassword,
        this.password
    )
};


const User = mongoose.model("User",userSchema)

module.exports = User;