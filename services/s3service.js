const AWS = require("aws-sdk");
require("dotenv").config();
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

exports.uploadToS3 = (type, data, fileName) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
  let s3Bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
    ContentType: type,
    ContentDisposition: "attachment",
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3Response) => {
      if (err) {
        console.log("something went wrong", err);
        reject(err);
      } else {
        // console.log("success", s3Response);
        resolve(s3Response.Location);
      }
    });
  });
};
