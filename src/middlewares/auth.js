const jwt = require("jsonwebtoken");

//------------------------------------------------------------------------------------------------------------------------------------------------------

const authentication = async (req, res, next) => {
    try {
        // token sent in request header 'authorization'
        const tokenWithBearer = req.headers["authorization"];

        // if token is not provided
        if (!tokenWithBearer) {
            return res.status(401).send({ status: false, message: "Token required! Please login to generate token" });
        }

        //split values if there is any space between & saved as array form  
        const tokenArray = tokenWithBearer.split(" ");

        //accessing the 2nd postion element by using index[1]
        const token = tokenArray[1];


        jwt.verify(token, "COMPANY_SECRET_123", { ignoreExpiration: true }, (error, decodedToken) => {
            // if token is not valid
            if (error) {
                return res.status(401).send({ status: false, message: "Token is invalid!" });

                // if token is valid
            } else {
                // checking if token session expired
                if (Date.now() > decodedToken.exp * 1000) {
                    return res.status(440).send({ status: false, message: "Session Expired" });
                }
                //exposing decoded token uid in request for everywhere access
                req.id = decodedToken.id;
                next();

            }
        }
        );

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};


module.exports = { authentication };