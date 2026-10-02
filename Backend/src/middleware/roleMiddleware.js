const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try{
            //checking authenticated user exist or not
            if(!req.user){
                return res.status(401).json({
                    sucess : false,
                    message : "Aurthentication required",
                    data :null
                });
            }
            //checking user role is allowed 
            if(!allowedRoles.includes(req.user.role)){
                return res.status(403).json({
                    success :false,
                    message : "you don't have permission to access this resource",
                    data : null
                });
            }
            //user have required role
            next();
        } catch (error){
            console.error("error", error);
            return res.status(500).json({
                success :false,
                message : "Authorization required",
                data : null
            });
        }
    };
};

module.exports = roleMiddleware;