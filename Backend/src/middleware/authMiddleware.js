const jwt  =  require("jsonwebtoken");

const authMiddleware = (req,res,next) =>{
    try{
        //getting authorization Header
        const authHeader = req.headers.authorization;
        if(!authHeader){
          return  res.status(401).json({
                success :false,
                message : "Authentication Token is Required",
                data : null
            });
        }

        //check bearer token format
        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success:false,
                message :"Invalid authentication Format",
                data :null
            });
        }
        //extract token
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({
                success :false,
                message : "authentication token is required",
                data : null
            });
        }

        //verifying JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        

        //attaching authenticated user informnation to request
        req.user = decoded;

        //continue to the next middleware
        next();
    }catch(error){
        console.error("error",error);
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({
                success :false,
                message : "Authentication token has expired",
                data :null
            });
        }

        if(error.name === "JsonWebTokenError"){
            return res.status(401).json({
                success :false,
                message : "Invalid Authentication tokren",
                data :null
            });
        }

        return res.status(500).json({
            success:false,
            message :"Authentication Failed",
            data :null
        });
    }
};

module.exports = authMiddleware