const AWS = require("aws-sdk")

AWS.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const uploadFile = async (file) => new Promise((resolve, reject) => {

    // this function will upload file to aws and return the link
    const S3 = new AWS.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

    const uploadParams = {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",
        Key: "employee-profiles/" + file.originalname,
        Body: file.buffer
    }


    S3.upload(uploadParams, (err, data) => {

        if (err) {
            return reject({ "error": err });
        }

        console.log(data);
        console.log("file uploaded succesfully");
        return resolve(data.Location);
    })

})



module.exports = { uploadFile };