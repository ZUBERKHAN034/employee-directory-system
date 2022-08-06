const express = require('express');
const router = express.Router();

const { userRegistration, userLogin, userUpdate, userUploadPicture, getUsers } = require('../controllers/employeeController');
const { createDepartment, getDepartments, getUsersByDepartment } = require('../controllers/departmentController');

const { authentication } = require('../middlewares/auth');


router.post("/registration", userRegistration);

router.post("/login", userLogin);

router.get("/get-employee", authentication, getUsers);

router.put("/employee/:id/uploadimage", authentication, userUploadPicture);

router.put("/employee/:id/editprofile", authentication, userUpdate);




router.post("/create-department", authentication, createDepartment);

router.get("/get-department", authentication, getDepartments);

router.post("/employees-by-department", authentication, getUsersByDepartment);

// if api is invalid OR wrong URL
router.all("/*", function (req, res) {
    res.status(404).send({ status: false, msg: "The api you requested is not available" })
});

module.exports = router;