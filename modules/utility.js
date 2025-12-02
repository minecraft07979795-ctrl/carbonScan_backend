
const dotenv = require('dotenv');
class Utility {




  constructor() {
    this.express = require('express');
    this.app = this.express();
    this.port = process.env.PORT || 5000;
    this.cors = require('cors');
    this.fs = require('fs');
    const { randomUUID } = require('crypto');
    // this.sql = require('mssql');
    const { v4: uuidv4 } = require('uuid');
    this.bodyParser = require('body-parser');
    this.jwt = require("jsonwebtoken");
    this.nodemailer = require("nodemailer");
    this.uuid = randomUUID;
    // this.secretAccessKey = "Z9nTWgBSySiRjnlRROL9nKal7mVCw5ZEimSqfBCy";  // AWS secret key
     
    // _________File Upload & Data Fetch_____________

    this.multer = require("multer");
    this.multerS3 = require('multer-s3');
    this.path   = require("path");
    this.XLSX   = require("xlsx");
    this.AWS = require("aws-sdk");  // Amazon Web Services SDK for cloud services 

    
     if (process.env.NODE_ENV === 'production') {
       dotenv.config({ path: '.env.production' });
     } else {
       dotenv.config({ path: '.env.local' });
     }

    this.secretAccessKey = process.env.SECRET_ACCESS_KEY;  // AWS secret key
    this.accessKeyId = process.env.ACCESS_KEY_ID;  // AWS access key
    this.s3Bucket = process.env.S3_BUCKET;  // S3 bucket name
    this.s3BucketURL = process.env.S3_BUCKET_URL;  // S3 bucket URL
    this.cloudfrontUrl = process.env.CLOUD_FRONT_URL;  // CloudFront distribution URL



    const storage =this.multer.diskStorage({
      destination : (req,file,cb) => { cb(null,"uploads/") },
      filename : (req,file,cb) => { cb(null , Date.now() + this.path.extname(file.originalname)); }
    });

    this.upload = this.multer({storage});
 

 // Configure AWS SDK with credentials and region
    this.AWS.config.update({
      apiVersion: "2010-12-01",
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      region: "ap-south-1"
    });

    // Create S3 service instance
    const s3 = new this.AWS.S3();

     this.sendPromise = new this.AWS.SES({
      apiVersion: "2010-12-01"
    });


    this.uploadfile = this.multer({storage: this.multer.memoryStorage()});
    this.uploadFileToS3 = ( fileBuffer, originalName, mimeType) => {
      return new Promise((resolve, reject) => {
        const key = `${uuidv4()}/${originalName}`;
    
        const params = {
          Bucket: this.s3Bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
          //ACL: 'public-read', // Optional
        };

        console.log('debug check for S3 bucket in dev',params );
        console.log('s3url',this.s3BucketURL);
        console.log('secretKey',this.secretAccessKey);
        console.log('accesskey',this.accessKeyId);
        console.log('cloudfronturl',this.cloudfrontUrl);
        s3.upload(params, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data.Location); // S3 file URL
        });
      });
    };



  
 


 
    // _____________postgress________________________________________

    const { Pool } = require('pg');

    const pgConfig = {

      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      // port: process.env.DB_PORT,
      // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

    };

    this.sql = new Pool(pgConfig);

    this.sql.query('SELECT NOW()')
      .then(res => {
        console.log("✅ PostgreSQL connected at:", res.rows[0].now);
      })
      .catch(err => {
        console.error("❌ PostgreSQL connection failed:", err.message);
      });


    this.sql.on('connect', () => console.log('Connected to PostgreSQL'));
    this.sql.on('error', err => console.error('PostgreSQL error', err));


    // _______________________________________________________________


    this.response = {
      init : async (res, _isSuccessful, _message,_data, _statusCode) => {
        if(!res || typeof res.status !== "function")
        {
          console.error("Invalid response object in init");
          return ;
        }


          const statusCode = _statusCode || (_isSuccessful ? 200 : 400);
          res.status(statusCode);
          this.response.send(res, {
            issuccessful : _isSuccessful,
            message: _message,
            data : _data || {}
          });


      },

      send: function (res,obj){
        if(!res._headerSent)
        {
          res.send(obj);
        }else{
          console.error("Response object is invalid or headers already sent.");
        }
      }


    }







    // Error handling AFTER defining response
    process.on('uncaughtException', err => {
      console.error("Uncaught Exception:", err);
    });

    process.on('unhandledRejection', err => {
      console.error("Unhandled Rejection:", err);
    });

  }


  // Generate JWT token
generateToken(payload, expiresIn = '24h') {
  const secret = process.env.JWT_SECRET || this.secretAccessKey;
  return this.jwt.sign(payload, secret, { expiresIn });
}

// Verify JWT token
verifyToken(token) {
  const secret = process.env.JWT_SECRET || this.secretAccessKey;
  return this.jwt.verify(token, secret);
}

// Enhanced authentication middleware (replace existing authenticateToken method)
authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return this.response.init(res, false, "Access token required", {
        error: "MISSING_TOKEN",
        message: "Authorization header with Bearer token is required"
      }, 401);
    }

    let decoded;
    try {
      decoded = this.verifyToken(token);
    } catch (err) {
      const errorMessage = err.name === 'TokenExpiredError' ? 
        'Token has expired' : 'Invalid token';
      
      return this.response.init(res, false, "Authentication failed", {
        error: err.name,
        message: errorMessage
      }, 401);
    }

    // Attach user info to request for use in your route handlers
    req.user = decoded;
    req.token = token;
    next();

  } catch (err) {
    console.error("Authentication Error:", err);
    return this.response.init(res, false, "Authentication error", {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred during authentication"
    }, 500);
  }
};


  executed = (obj) => {
  try {
    // PostgreSQL returns rows (not recordsets)
    const firstRow = obj.rows[0];
    // console.log("obj  ->>",obj)
 
    const o = {
      issuccessful: true,
      // message: firstRow?.message_result || "Success"
      message: firstRow?.message || "Success"
    };

    if (firstRow.message_result == 'False') {
      o.issuccessful = false;
    }

    return o;
  } catch (error) {
    console.log("⚠️ executed() error:", error);
    return {
      issuccessful: false,
      message: "An error occurred while executing the query"
    };
  }
};
 


//postgree

// authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     // console.log("token ->",token);

//     if (!token) {
//       return this.response.init(res, false, "Unauthorized-access", {
//         error: "Unauthorized-access",
//         message: "Token is missing"
//       }, 401);
//     }

//     let user;


//     try {
//   user = await this.jwt.verify(token, this.secretAccessKey);

//   // console.log("✅ Decoded user:", user);
// } catch (err) {
//   console.log("❌ JWT Verify Error:", err.message); // ADD THIS
//   return this.response.init(res, false, "Unauthorized-access", {
//     error: "Unauthorized-access",
//     message: "Invalid token"
//   }, 401);
// }

//     const email = user.userName;

//     // console.log("email->",email);


//     if (!this.sql) {
//       throw new Error("SQL connection is not initialized");
//     }

//     // ✅ PostgreSQL parameterized query
//     const checkSessionQuery = {
//       text: 'SELECT * FROM dbo.User_Sessions WHERE UserName = $1 AND Session_Token = $2',
//       values: [email, token]
//     };

//     const sessionResult = await this.sql.query(checkSessionQuery);

//     // console.log("🔎 Session Result:", sessionResult.rows);

//     if (!sessionResult.rows || sessionResult.rows.length === 0) {
//       return this.response.init(res, false, "Unauthorized-access", {
//         error: "Unauthorized-access",
//         message: "Session expired or invalid"
//       }, 401);
//     }

//     // ✅ Attach email to request for further use
//     req.email = email;
//     return next();

//   } catch (err) {
//     console.error("Authentication Error:", err);
//     return this.response.init(res, false, "Internal server error", {
//       error: "Internal server error",
//       message: "An unexpected error occurred"
//     }, 500);
//   }
// };



// _____________________________________________________________________________________________________________________


 



  validateData(res, name, fieldName) {
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!nameRegex.test(name)) {
      this.response.init(res, false, `${fieldName} must only contain letters and spaces.`);
      return false;
    }

    return true;
  }

 
 



}

module.exports = Utility;
