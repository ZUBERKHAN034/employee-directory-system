const employeeModel = require('../models/employeeModel');
const departmentModel = require('../models/departmentModel');

const { isValidRequestBody, isValid, isValidName } = require('../utils/utils');

const createDepartment = async (req, res) => {
    try {

        // data sent through request body
        const requestBody = JSON.parse(JSON.stringify(req.body));

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide department Details" })
        }

        if (!isValid(requestBody.name) || !isValidName(requestBody.name)) {
            return res.status(400).send({ status: false, message: "name is required and it should contain only alphabets" });
        }

        const isDepartmentAlreadyPresent = await departmentModel.findOne({ name: requestBody.name });
        if (isDepartmentAlreadyPresent) {
            return res.status(400).send({ status: false, message: `${requestBody.name.toLowerCase()} named department is already present!` });
        }

        const departmentCreated = await departmentModel.create(requestBody);
        res.status(200).send({ status: true, message: "Department successfully created", data: departmentCreated });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const getDepartments = async (req, res) => {
    try {

        const departments = await departmentModel.find().select({ __v: false, updatedAt: false });
        if(departments.length === 0){
            return res.status(404).send({ status: false, message: "Departments not found!" });
        }
        res.status(200).send({ status: true, message: "Departments list", data: departments });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const getUsersByDepartment = async (req, res) => {
    try {

        // data sent through request body
        const requestBody = JSON.parse(JSON.stringify(req.body));

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide department Details" })
        }

        if (!isValid(requestBody.department_name) || !isValidName(requestBody.department_name)) {
            return res.status(400).send({ status: false, message: "please provide department_name first!" });
        }

        const isDepartmentPresent = await departmentModel.findOne({ name: requestBody.department_name });
        if (!isDepartmentPresent) {
            return res.status(400).send({ status: false, message: `${requestBody.department_name.toLowerCase()} named department is not present!` });
        }

        const employees = await employeeModel.find({ department_id: isDepartmentPresent._id }).select({ __v: false, updatedAt: false });
        if (employees.length === 0) {
            return res.status(404).send({ status: false, msg: `employees details not found for ${requestBody.department_name.toLowerCase()} ` });
        }

        const employeesByDepartment = {
            _id: isDepartmentPresent._id,
            name: isDepartmentPresent.name,
            createdAt: isDepartmentPresent.createdAt,
            employees: employees
        }

        res.status(200).send({ status: true, data: employeesByDepartment });

    } catch (err) {
        res.status(500).send({ status: false, message: "Internal Server Error", error: err.message });
    }
};


module.exports = { createDepartment, getDepartments, getUsersByDepartment };