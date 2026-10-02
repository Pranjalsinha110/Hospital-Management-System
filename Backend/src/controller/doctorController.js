const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

const createDoctor = async (req,res) => {
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        const {
              name,
            email,
            password,
            phone,
            specialization,
            qualification,
            experience,
            consultationFee,
            licenseNumber,
            department ,
            bio,
            profileImage,
            availableDays,
            availableTime
        } = req.body
        
        //required field validation
        if(
            !name ||
            !email ||
            !password ||
            !specialization ||
            !qualification ||
            experience === undefined ||
            consultationFee === undefined ||
            !licenseNumber ||
            !department
        ){
            await session.abortTransaction();
            return res.status(400).json({
                success :false,
                message : "All required Doctor Field Must be Provided",
                data : null

            });
        }

            // Finding department
        const departmentData = await Department.findOne({
            name: department.trim(),
            isActive: true
        }).session(session);

        if (!departmentData) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Department not found or inactive",
                data: null
            });
        }


        //checking whether email already exists or not
        const existingUser = await User.findOne({email}).session(session);
        if(existingUser){
            await session.abortTransaction();
            return res.status(409).json({
                success :false,
                message : "User with this eamil already exists",
                data : null
            })
        }
        
        //checking whether the license number is already exist or not
        const existingDoctor  = await Doctor.findOne({licenseNumber}).session(session);
        if(existingDoctor){
            await session.abortTransaction();
            return res.status(409).json({
                success :false,
                message : "Doctor with this licence Number already exist",
                data :null
            });
        }

        //Creating User Account
        const user = new User({
            name,
            email,
            password,
            phone,
            role : "doctor"
        });
        await user.save({session});
        //Creating Doctor Profile
        const doctor = new Doctor({
            user: user._id,
            specialization,
            qualification,
            experience,
            consultationFee,
            licenseNumber,
            department : departmentData._id,
            bio,
            profileImage,
            availableDays,
            availableTime
        });
        await doctor.save({session});

        //Commiting transition
        await session.commitTransaction();
        return res.status(201).json({
            success :true,
            message : "Doctor created Sucessfully",
            data : {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isActive: user.isActive
                },
                 doctor: {
                    id: doctor._id,
                    specialization: doctor.specialization,
                    qualification: doctor.qualification,
                    experience: doctor.experience,
                    consultationFee: doctor.consultationFee,
                    licenseNumber: doctor.licenseNumber,
                    department: doctor.department,
                    bio: doctor.bio,
                    profileImage: doctor.profileImage,
                    availableDays: doctor.availableDays,
                    availableTime: doctor.availableTime,
                    isAvailable: doctor.isAvailable
                }
            }
        });
    } catch (error){
        await session.abortTransaction();
        console.error("Create Doctor error : ", error);

        //duplicatte key error
        if(error.code===11000){
            return res.status(409).json({
                success : false,
                message : "Duplicate doctor informationalreadyu exists",
                data :null
            });
        }

        return res.status(500).json({
            success :false,
            message : "Failed to Create doctor",
            data : null
        });
    }finally{
        await session.endSession();
    }
};


const getAllDoctors = async (req,res) => {
    try{
        const doctors = await Doctor.find()
        .populate(
            "user",
            "name email phone role isActive"
        ).populate(
        "department",
        "name description isActive"
        )
        .sort({createdAt : -1});

        return res.status(200).json({
            success :true,
            message : "Doctor fetched successfully.",
            data : doctors
        });
    } catch(error){
        console.error("Get all Doctor Error", error.message);
        return res.status(500).json({
            success: false,
            message : "Failed to fetch the data",
            data : null
        });
    }
};

const updateDoctor = async (req,res) => {
    const session  = await mongoose.startSession();
    
    try{
        session.startTransaction();
        const {id} = req.params;
        const {
             name,
            email,
            phone,
            specialization,
            qualification,
            experience,
            consultationFee,
            licenseNumber,
            department,
            bio,
            profileImage,
            availableDays,
            availableTime,
            isAvailable
        } = req.body;

        //finding doctor
        const doctor = await Doctor.findById(id).session(session);

        if(!doctor){
            await session.abortTransaction();
            return res.status(404).json({
                success :false,
                message :"Doctor not Found",
                data : null
            });
        }

        //finding linked user
        const user = await User.findById(doctor.user).session(session);
            if(!user){
                await session.abortTransaction();
                return res.status(404).json({
                    success :false,
                    message : "Associated user account not found",
                    data :null
                });
            }

            //checking email uniqueness if email is being updated
            if(email && email !== user.email){
                const existingUser = await User.findOne({
                    email,
                    _id : {$ne : user._id}
                }).session(session);


                if(existingUser){
                    await session.abortTransaction();
                    return res.status(409).json({
                        success : false,
                        message : "User with this email already exists",
                        data:null
                    });
                }
            }

            //checking licence number uniqueness if being  updated 
            if(licenseNumber && licenseNumber !== doctor.licenseNumber){
                const existingDoctor = await Doctor.findOne({
                    licenseNumber,
                    _id : {$ne :doctor._id}
                }).session(session);

                if(existingDoctor){
                    await session.abortTransaction();
                    return res.status(409).json({
                        success: false,
                        message : "Doctor with this Licence number alreafy exists",
                        data : null
                    });
                }
            }
            //Update User Field
             if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;
            if (phone !== undefined) user.phone = phone;

            await user.save({ session });

            //Updating Doctor Field
            if (specialization !== undefined)
                doctor.specialization = specialization;

            if (qualification !== undefined)
                doctor.qualification = qualification;

            if (experience !== undefined)
                doctor.experience = experience;

            if (consultationFee !== undefined)
                doctor.consultationFee = consultationFee;

            if (licenseNumber !== undefined)
                doctor.licenseNumber = licenseNumber;

            if (department !== undefined){
                const departmentData = await Department.findOne({
                name: department.trim(),
                isActive: true
            }).session(session);

            if (!departmentData) {
                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message: "Department not found or inactive",
                    data: null
                });
    }

    doctor.department = departmentData._id;
            }
               

            if (bio !== undefined)
                doctor.bio = bio;

            if (profileImage !== undefined)
                doctor.profileImage = profileImage;

            if (availableDays !== undefined)
                doctor.availableDays = availableDays;

            if (availableTime !== undefined)
                doctor.availableTime = availableTime;

            if (isAvailable !== undefined)
                doctor.isAvailable = isAvailable;

        await doctor.save({ session });
        //Commiting Transction
        await session.commitTransaction();
        return res.status(200).json({
            success :true,
            message : "Doctor Updated Successfully",
            data : {
                 user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isActive: user.isActive
                },
                 doctor: {
                    id: doctor._id,
                    specialization: doctor.specialization,
                    qualification: doctor.qualification,
                    experience: doctor.experience,
                    consultationFee: doctor.consultationFee,
                    licenseNumber: doctor.licenseNumber,
                    department: doctor.department,
                    bio: doctor.bio,
                    profileImage: doctor.profileImage,
                    availableDays: doctor.availableDays,
                    availableTime: doctor.availableTime,
                    isAvailable: doctor.isAvailable
                }
            }
        });
    } catch (error){

            console.error("doctorUpdate error", error.message);

         if (session.inTransaction()) {
        await session.abortTransaction();
            }
        if(error.code===11000){
            return res.status(409).json({
                success: false,
                message: "Duplicate doctor information already exists",
                data: null
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update doctor",
            data: null
        });
        
    }finally{
        await session.endSession();
    }
}


const getDoctorById = async (req,res) => {
     try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id)
            .populate(
                "user",
                "name email phone role isActive"
            ).populate(
                "department",
                "name description isActive"
            );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor fetched successfully by id",
            data: doctor
        });

    } catch (error) {
        console.error("get dcotor by id error", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctor",
            data: null
        });
    }
}


const updateDoctorStatus = async (req,res) =>{
    const session  = await mongoose.startSession();
    
    try{
        session.startTransaction();
        const{id} = req.params;
        const {isActive} = req.body;

        //Validating Status
        if(typeof isActive !== "boolean"){
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message : "isActive must be a boolean value",
                data : null
            });
         }
           //Finding linked User
            const doctor = await Doctor.findById(id).session(session);
           
            if(!doctor){
                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message: "Doctor not found",
                    data: null
                });
          }

           const user = await User.findById(doctor.user).session(session);
            if(!user){
                await session.abortTransaction();
                return res.status(404).json({
                    success : false,
                    message : "Asscociated User account not found",
                    data :null
                });
            }
            
            //Updating ACcount Status
            user.isActive = isActive;
            await user.save({session});
        // If doctor is deactivated,
        // make doctor unavailable for appointments


            if(!isActive){
                doctor.isAvailable  = false;
                await doctor.save({session});
            }
            await session.commitTransaction();
            return res.status(200).json({
                success: true,
            message: isActive
                ? "Doctor activated successfully"
                : "Doctor deactivated successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                },
                doctor: {
                    id: doctor._id,
                    isAvailable: doctor.isAvailable
                }
            }
            });
    } catch(error){
        console.error("update doctor status error",  error.message);
        if(session.inTransaction()){
            await session.abortTransaction();
        }
        return res.status(500).json({
              success: false,
            message: "Failed to update doctor status",
            data: null
        });
    }finally{
        await session.endSession();
    }
} 

const getAvailableDoctors = async (req, res) => {
    try {
        const { department } = req.query;

        // Department is required
        if (!department || !department.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department is required",
                data: null
            });
        }

        // Finding active department
        const departmentData = await Department.findOne({
            name: department.trim(),
            isActive: true
        });

        if (!departmentData) {
            return res.status(404).json({
                success: false,
                message: "Department not found or inactive",
                data: null
            });
        }

        // Finding available doctors
        const doctors = await Doctor.find({
            department: departmentData._id,
            isAvailable: true
        })
        .populate({
            path: "user",
            match: {
                role: "doctor",
                isActive: true
            },
            select: "name email phone role isActive"
        })
        .populate(
            "department",
            "name description isActive"
        )
        .sort({ createdAt: -1 });

        // Remove doctors whose linked user is inactive/missing
        const availableDoctors = doctors.filter(
            (doctor) => doctor.user !== null
        );

        return res.status(200).json({
            success: true,
            message: "Available doctors fetched successfully",
            data: availableDoctors
        });

    } catch (error) {
        console.error(
            "Get Available Doctor Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch available doctors",
            data: null
        });
    }
};

module.exports = {
    createDoctor,
    getAllDoctors,
    updateDoctor,
    getDoctorById,
    updateDoctorStatus,
    getAvailableDoctors
}