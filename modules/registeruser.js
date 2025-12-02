const { text } = require('body-parser');
const passwordUtils = require('../utils/passwordUtils');
// let companyprofile = require('../model/company_profile_class.js');

class registeruser { 
    constructor(_utility) {
      this.utility = _utility;
    }


    

//_______________________________________InsertUser____________________________________________________





//postgree 

// Old
// UserLogin = async (req, res) => {
//   try {
//     const { UserName, Password } = req.body;

//     if (!UserName || !Password) {
//       return this.utility.response.init(res, false, "Username and Password are required");
//     }

//     const result = await this.utility.sql.query(  'SELECT * FROM dbo.login_user($1, $2)',  [UserName, Password]);

//     // console.log('🔵 Result rows:', result.rows);

//     const loginResult = result.rows[0];

//     // console.log("loginResult->>",loginResult);

    
//     // 2. Check if login failed
//     if (!loginResult || loginResult?.user_data?.Message === 'Invalid Username or Password' || loginResult.message_result === 'False' || loginResult.o_status === 'False') {
//       return this.utility.response.init(res, false, loginResult?.user_data?.Message || "Login failed");
//     }

//     // const UserType = loginResult?.user_data?.UserType;
//     const UserType = loginResult?.details?.UserType;
//     const Designation = loginResult?.details?.Designation;
//     const AuditorName = loginResult?.details?.AuditorName;
//     const industryid = loginResult?.details?.industryid;
//     const masteruserid = loginResult?.details?.masteruserid;
//     const userid = loginResult?.details?.userid;
//     // 3. Generate JWT token
//     const token = await this.utility.jwt.sign({ userName: UserName },this.utility.secretAccessKey,{ expiresIn: "1d" });

//     // 4. Insert session token
//     try {
//       // console.log('🔵 Inserting session token...');
//       const sessionResult = await this.utility.sql.query(  'SELECT * FROM dbo.fn_insert_session_tokens($1, $2)',  [UserName, token]);
//       // console.log('✅ Session token inserted:', sessionResult.rows);
//     } catch (sessionError) {
//       console.log('⚠️ Session token error (continuing anyway):', sessionError.message);
//     }

//     // 5. Prepare response
//     const responseData = {
//       token: token,
//       user: {
//         userName: UserName,
//         UserType: UserType,
//         Designation: Designation,
//         AuditorName: AuditorName,
//         industryid: industryid,
//         masteruserid: masteruserid,
//         userid: userid
//       }
//     };

//     return this.utility.response.init(res, true, loginResult.message || "Login successful", responseData);

//   } catch (err) {
//     console.log('❌ Login error occurred:', err.message);
//     return this.utility.response.init(res, false, "Login failed", { error: err.message });
//   }
// };


// New

UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("password",password)
    // const decryptedPassword = passwordUtils.decrypt(password);
    // console.log("decryptedPassword",decryptedPassword)

    // Your existing database authentication
    const query = {
      text: 'SELECT * FROM public.authenticate_user($1, $2)',
      // values: [email, decryptedPassword]
      values: [email, password]
    };

    const result = await this.utility.sql.query(query);
    const row = result?.rows?.[0];

    if (!row) {
      return this.utility.response.init(res, false, "Authentication failed", { 
        error: "No response from authentication function" 
      });
    }

    const success = row.login_status === 'Login successful';
    
    if (!success) {
      return this.utility.response.init(res, false, row.login_status, {
        error: "AUTHENTICATION_FAILED"
      });
    }

    // 🔥 NEW: Generate JWT token
    const tokenPayload = {
      email: email,
      userId: row.user_id || row.id,
      userType: row.user_type || 'user',
      loginTime: new Date().toISOString()
    };

    // const token = this.utility.generateToken(tokenPayload, '24h');

    const token = this.utility.generateToken(tokenPayload, process.env.JWT_EXPIRES_IN || '24h');

    // Prepare response with token
    const responseData = {
      token: token,
      user: {
        email: email,
        userId: row.user_id || row.id,
        userType: row.user_type || 'user',
        ...row // Include other user data
      },
      expiresIn: '24h'
    };

    return this.utility.response.init(res, true, "Login successful", responseData);

  } catch (err) {
    console.error('Login error:', err);
    return this.utility.response.init(res, false, "Login failed", { 
      error: err.message 
    });
  }
};

UserLogout = async (req, res) => {
  try {
    // Token is automatically validated by authenticateToken middleware
    // req.user contains the decoded token data
    const userEmail = req.user.email;

    // Simple logout - just return success
    // The token will expire naturally after 24 hours
    return this.utility.response.init(res, true, "Logout successful", {
      message: `User ${userEmail} logged out successfully`
    });

  } catch (err) {
    console.error("Logout Error:", err);
    return this.utility.response.init(res, false, "Logout failed", { 
      error: err.message 
    });
  }
};

UpdateUserPassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return this.utility.response.init(res, false, "userId, oldPassword and newPassword are required");
    }

    const query = {
      text: 'SELECT public.update_user_password($1, $2, $3) AS message',
      values: [userId, oldPassword, newPassword]
    };

    const result = await this.utility.sql.query(query);
    const message = result?.rows?.[0]?.message || 'Unknown response';

    const success = message === 'Password updated successfully.';

    return this.utility.response.init(res, success, message);
  } catch (err) {
    return this.utility.response.init(res, false, "Password update failed", { error: err.message });
  }
};


//  Old
// userlogout = async (req, res) => {
//   try {
//     const token = req.headers['authorization']?.split(' ')[1];

//     console.log("🔑 Token:", token);

//     if (!token) {
//       return this.utility.response.init(res, false, "Token is required.");
//     }

//     const email = req.email; // Already decoded from middleware

//     // const {email} = req.body;

//     if (!email) {
//       return this.utility.response.init(res, false, "Invalid token.");
//     }

//     // Step 1: Check if user has an active session
//     const checkSessionQuery = {
//       text: 'SELECT * FROM dbo.User_Sessions WHERE UserName = $1',
//       values: [email]
//     };

//     const sessionResult = await this.utility.sql.query(checkSessionQuery);

//     if (sessionResult.rows.length === 0) {
//       return this.utility.response.init(res, false, "No active session found.");
//     }

//     const sessionId = sessionResult.rows[0].sessionid;

//     // Step 2: Delete the session
//     const deleteSessionQuery = {
//       text: 'DELETE FROM dbo.User_Sessions WHERE SessionID = $1',
//       values: [sessionId]
//     };

//     await this.utility.sql.query(deleteSessionQuery);

//     return this.utility.response.init(res, true, "Logout successful.");
//   } catch (err) {
//     console.log("❌ Logout Error:", err.message);
//     return this.utility.response.init(res, false, "Something went wrong, please try again later.", { error: err.message });
//   }
// };

// Old
// ResetUserPassword = (req, res) => {
//   try {
//     const { UserName, UserCode, NewPassword, Confirm_Password } = req.body;

//     if (!UserName) {
//       return res.status(400).json({ issuccessful: false, message: "Email field must be provided" });
//     }

//     // 🔹 Verify OTP
//     if (UserCode && !NewPassword && !Confirm_Password) {
//       const query = {
//         text: `SELECT * FROM dbo.fn_resetUserPassword($1, $2, NULL, NULL);`,
//         values: [UserName, UserCode]
//       };

//       this.utility.sql.query(query, (err, result) => {
//         if (err) {
//           return res.status(500).json({ issuccessful: false, message: "Database error", error: err });
//         }

//         const executed = this.utility.executed(result);
//         if (executed.issuccessful) {
//           return res.status(200).json({ issuccessful: true, message: "UserCode verified successfully" });
//         } else {
//           return res.status(400).json({ issuccessful: false, message: executed.message });
//         }
//       });

//     } 
//     // 🔹 Request OTP
//     else if (!UserCode && !NewPassword && !Confirm_Password) {

//         console.log("first11")
//       const query = {
//         text: `SELECT * FROM dbo.fn_resetUserPassword($1, NULL, NULL, NULL);`,
//         values: [UserName]
//       };

//       this.utility.sql.query(query, async (err, result) => {
//         if (err) {
//           return res.status(500).json({ issuccessful: false, message: "Database error", error: err });
//         }

//         const executed = this.utility.executed(result);
//         const data = result.rows[0];

//         const responseData = result.rows[0];

//         if (responseData.o_status === "True") {
//             if (data && data.o_usercode) {
//             const mailResult = await this.utility.sendMail(UserName, data.o_usercode);
//             if (mailResult) {
//               return res.status(200).json({ issuccessful: true, message: "Email sent.", data: { UserCode: data.o_usercode } });
//             } else {
//               return res.status(500).json({ issuccessful: false, message: "Failed to send email." });
//             }
//           }
//           return this.utility.response.init(res, true, responseData.message, result.rows);
//         } else {
//           return this.utility.response.init(res, false, responseData.message, { error: responseData.errordetails });
//         }

//         // if (executed.issuccessful) {
//         //   if (data && data.usercode) {
//         //     const mailResult = await this.utility.sendMail(UserName, data.usercode);
//         //     if (mailResult) {
//         //       return res.status(200).json({ issuccessful: true, message: "Email sent.", data: { UserCode: data.usercode } });
//         //     } else {
//         //       return res.status(500).json({ issuccessful: false, message: "Failed to send email." });
//         //     }
//         //   }
//         // } else {
//         //   return res.status(400).json({ issuccessful: false, message: executed.message });
//         // }
//       });

//     } 
//     // 🔹 Reset Password
//     else {
//       const query = {
//         text: `SELECT * FROM dbo.fn_resetUserPassword($1, $2, $3, $4);`,
//         values: [UserName, UserCode, NewPassword, Confirm_Password]
//       };

//       this.utility.sql.query(query, (err, result) => {
//         if (err) {
//           return res.status(500).json({ issuccessful: false, message: "Database error", error: err });
//         }

//         const responseData = result.rows[0];

//         if (responseData.o_status) {
//           return res.status(200).json({ issuccessful: true, message: responseData.o_message });
//         } else {
//           return res.status(400).json({ issuccessful: false, message: responseData.o_message });
//         }
//       });
//     }

//   } catch (error) {
//     return res.status(500).json({ issuccessful: false, message: "Something went wrong", error });
//   }
// };


  RegisterUser = async (req, res) => {
    try {
      const {
        full_name,
        email,
        password,
        phone_number,
        org_id,
        facility_id,
        role_id
      } = req.body;

      const query = {
        text: 'SELECT * FROM register_user($1, $2, $3, $4, $5, $6, $7)',
        values: [
          full_name,
          email,
          password, // Will be hashed by the database function
          phone_number,
          org_id,
          facility_id,
          role_id
        ]
      };

      const result = await this.utility.sql.query(query);
      
      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "Registration failed", {
          error: "REGISTRATION_FAILED"
        }, 400);
      }

      const { new_user_id, status_message } = result.rows[0];

      if (!new_user_id) {
        return this.utility.response.init(res, false, status_message || "Registration failed", {
          error: "REGISTRATION_FAILED"
        }, 400);
      }

      return this.utility.response.init(
        res,
        true,
        status_message || "User registered successfully",
        {
          user_id: new_user_id,
          email,
          full_name,
          facility_id,
          role_id
        },
        201
      );

    } catch (error) {
      console.error('Error during user registration:', error);
      let errorMessage = "Internal server error during registration";
      let errorCode = "INTERNAL_SERVER_ERROR";
      let statusCode = 500;

      if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = "A user with this email already exists";
        errorCode = "EMAIL_ALREADY_EXISTS";
        statusCode = 400;
      }

      return this.utility.response.init(
        res, 
        false, 
        errorMessage, 
        {
          error: errorCode,
          details: error.message
        }, 
        statusCode
      );
    }
  };

 



}
module.exports = registeruser;
