const employeeModel = require('../models/employeeModel');
const departmentModel = require('../models/departmentModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { isValidObjectId, isValidRequestBody, isValid, isValidEmail, isValidPassword, isValidName } = require('../utils/utils');
const { uploadFile } = require('../utils/aws_bucket');

//------------------------------------------------------------------------------------------------------------------------------------------------------

const userRegistration = async (req, res) => {
    try {
        // data sent through request body
        const requestBody = JSON.parse(JSON.stringify(req.body));

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide employee Details" })
        }

        let employeeData = {};

        const { first_name, last_name, email, password, department_name } = requestBody;

        if (!isValid(first_name) || !isValidName(first_name)) {
            return res.status(400).send({ status: false, message: "first_name is required and it should contain only alphabets" })
        }
        employeeData['first_name'] = first_name;

        if (!isValid(last_name) || !isValidName(last_name)) {
            return res.status(400).send({ status: false, message: "last_name is required and it should contain only alphabets" })
        }
        employeeData['last_name'] = last_name;

        if (!isValid(email) || !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "email is required and it should be a valid email" });
        }

        const isEmailAlreadyPresent = await employeeModel.findOne({ email: email });
        if (isEmailAlreadyPresent) {
            return res.status(400).send({ status: false, message: "email already present!" });
        }
        employeeData['email'] = email;

        // Checking the length of password
        if (!isValid(password) || !isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Please enter valid [ min 8 and max 15 ] password!" });
        }

        //Encrypting Password by Bcrypt
        const encryptedPassword = await bcrypt.hash(password, 10);
        employeeData['password'] = encryptedPassword;

        if (!isValid(department_name) || !isValidName(department_name)) {
            return res.status(400).send({ status: false, message: "department_name is required and it should contain only alphabets" })
        }

        const isDepartmentPresent = await departmentModel.findOne({ name: department_name });
        if (!isDepartmentPresent) {
            return res.status(404).send({ status: false, message: `${department_name.toLowerCase()} named department is not present!` });
        }
        employeeData['department_id'] = isDepartmentPresent._id;

        const files = req.files;
        // if there is any file it will be update
        if (files && files.length > 0) {
            employeeData['profile_url'] = await uploadFile(files[0]);
        }

        const employeeCreated = await employeeModel.create(employeeData);
        res.status(200).send({ status: true, message: "Account successfully created", data: employeeCreated });


    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const userLogin = async (req, res) => {
    try {
        // login credentials sent through request body
        const email = req.body.email;
        const password = req.body.password;

        // if email is empty
        if (!isValid(email) || !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Please enter valid email!" });
        }

        // if password is empty
        if (!isValid(password) || !isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Please enter valid [ min 8 and max 15 ] password!" });
        }

        const user = await employeeModel.findOne({ email: email });

        // Checking User exists or not
        if (!user) {
            return res.status(401).send({ status: false, message: "The email address you entered isn't connected to an account. Register a new employee first." });
        }

        //Decrypt password by Bcrypt and Compare the password with password from request body
        const decrypPassword = user.password;
        const pass = await bcrypt.compare(password, decrypPassword)
        if (!pass) {
            return res.status(400).send({ status: false, message: "Password Incorrect" })
        }

        // JWT generation using sign function
        const token = jwt.sign(
            { email: user.email, id: user._id }, "COMPANY_SECRET_123", { expiresIn: "24h" }
        );

        // Sending token in response header
        res.setHeader('Authorization', 'Bearer ' + token);
        res.status(200).send({ status: true, message: "Logged in successfully", id: user._id, token: token });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const userUpdate = async (req, res) => {
    try {

        const requestBody = JSON.parse(JSON.stringify(req.body));
        const id = req.params.id;

        if (!isValidObjectId(id)) {
            return res.status(400).send({ status: false, message: "Invalid id in params." });
        }

        const employee = await employeeModel.findById(id);
        if (!employee) {
            return res.status(404).send({ status: false, message: 'employee not found' });
        }

        // compare decodedToken-[req.id] with params id
        if (id != req.id) {
            return res.status(403).send({ status: false, message: "unauthorized access!" });
        }

        let employeeDataUpdate = {};

        const { first_name, last_name, email, password, department_name } = requestBody;

        if (requestBody.hasOwnProperty('first_name')) {
            // if first_name is empty
            if (!isValid(first_name) || !isValidName(first_name)) {
                return res.status(400).send({ status: false, message: "first_name is required and it should contain only alphabets" })
            }
            employeeDataUpdate['first_name'] = first_name;
        }


        if (requestBody.hasOwnProperty('last_name')) {
            // if last_name is empty
            if (!isValid(last_name) || !isValidName(last_name)) {
                return res.status(400).send({ status: false, message: "last_name is required and it should contain only alphabets" })
            }
            employeeDataUpdate['last_name'] = last_name;
        }

        if (requestBody.hasOwnProperty("email")) {
            // if email is empty
            if (!isValid(email) || !isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "please provide email and it be a valid email" });
            }

            // Checking E-mail for Uniqueness
            const isEmailAlreadyPresent = await employeeModel.findOne({ email: email });
            if (isEmailAlreadyPresent) {
                return res.status(400).send({ status: false, message: `${email} is already present!` });
            }

            employeeDataUpdate['email'] = email;
        }

        if (requestBody.hasOwnProperty("password")) {
            // Checking the length of password
            if (!isValid(password) || !isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "please provide password and it be Valid min 8 and max 15" })
            }

            // if new password is same as old password
            const isSamePassword = await bcrypt.compare(password, employee.password);
            if (isSamePassword) {
                return res.status(400).send({ status: false, message: "entered password is same as old password!" })
            }

            //Encrypting Password by Bcrypt package
            const newEncryptedPassword = await bcrypt.hash(password, 10);
            employeeDataUpdate['password'] = newEncryptedPassword;
        }

        if (requestBody.hasOwnProperty('department_name')) {
            // if department_name is empty
            if (!isValid(department_name) || !isValidName(department_name)) {
                return res.status(400).send({ status: false, message: "department_name is required and it should contain only alphabets" })
            }

            const isDepartmentPresent = await departmentModel.findOne({ name: department_name });
            if (!isDepartmentPresent) {
                return res.status(404).send({ status: false, message: `${department_name.toLowerCase()} named department is not present!` });
            }
            employeeDataUpdate['department_id'] = isDepartmentPresent._id;
        }

        const files = req.files;
        // if there is any file it will be update
        if (files && files.length > 0) {
            employeeDataUpdate['profile_url'] = await uploadFile(files[0]);
        }

        if (!isValidRequestBody(employeeDataUpdate)) {
            return res.status(400).send({ status: false, message: "please provide employee Details or employee profile" })
        }

        const updatedEmployee = await employeeModel.findOneAndUpdate({ _id: id }, employeeDataUpdate, { new: true })
        res.status(200).send({ status: true, message: 'Successfully updated', data: updatedEmployee });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const userUploadPicture = async (req, res) => {
    try {

        const id = req.params.id;

        if (!isValidObjectId(id)) {
            return res.status(400).send({ status: false, message: "Invalid id in params." });
        }

        const employee = await employeeModel.findById(id);
        if (!employee) {
            return res.status(404).send({ status: false, message: 'employee not found' });
        }

        // compare decodedToken-[req.id] with params id
        if (id != req.id) {
            return res.status(403).send({ status: false, message: "unauthorized access!" });
        }

        const files = req.files;
        // if there is any file it will be update
        if (files && files.length > 0) {

            const uploadedImageUrl = await uploadFile(files[0]);

            const updatedEmployee = await employeeModel.findOneAndUpdate({ _id: id }, { profile_url: uploadedImageUrl }, { new: true })
            res.status(200).send({ status: true, message: 'Successfully updated', data: updatedEmployee });

        } else {

            return res.status(400).send({ status: false, message: "please select profile image" });
        }

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

const getUsers = async (req, res) => {
    try {

        const employees = await employeeModel.find().select({ __v: false, updatedAt: false }).populate('department_id','_id name createdAt');

        if (employees.length === 0) {
            return res.status(404).send({ status: false, message: "employees not found!" });
        }

        res.status(200).send({ status: true, message: "Department list", data: employees });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports = { userRegistration, userLogin, userUpdate, userUploadPicture, getUsers };