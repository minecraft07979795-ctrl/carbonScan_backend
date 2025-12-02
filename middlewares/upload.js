const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temp local folder
module.exports = upload;

