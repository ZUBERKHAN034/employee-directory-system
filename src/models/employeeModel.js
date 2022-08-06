const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({

    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    profile_url: {
        type: String,
        default: "profile picture not available",
        required: true,
        trim: true
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    }

}, { timestamps: true })

module.exports = mongoose.model('Employee', employeeSchema);