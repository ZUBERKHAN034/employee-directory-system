const mongoose = require("mongoose");

// ObjectId validation
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId); // returns a boolean
};

// RequestBody validation
const isValidRequestBody = function (reqbody) {
    if (!Object.keys(reqbody).length) {
        return false;
    }
    return true;
};

// string validation 
const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length == 0) return false;
    if (typeof value === "string") return true;
};


// email validation
const isValidEmail = function (email) {
    const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return pattern.test(email); // returns a boolean
};


//password validation
const isValidPassword = function (password) {
    if (password.length >= 8 && password.length <= 15) {
        return true;
    }
    return false;
};

//reviewedBy validation
const isValidName = function (value) {
    const pattern = /^[a-zA-Z,'.\-\s]*$/;
    return pattern.test(value);
};


module.exports = { isValidObjectId, isValidRequestBody, isValid, isValidEmail,  isValidPassword, isValidName };
