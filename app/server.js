

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); 
const cors = require("cors");
var cron = require('node-cron');
const app = express();
const cloudinary = require("cloudinary").v2;
const facilitiesRoutes = require("./routes/facilities.routes.js");
const {updateVoucherCronJob_2} = require('./models/room.model.js')
const {cronJobUpdateShow} = require('./models/voucher.model.js')


var corsOptions = {
  origin: "http://localhost:8080",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  express.urlencoded({ extended: true })
); 
app.use("/upload", express.static("public/images"));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to server." });
});

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

require("./routes/typeroom.routes.js")(app);
require("./routes/typeservice.routes.js")(app);
require("./routes/service.routes.js")(app);
require("./routes/employee.routes.js")(app);
require("./routes/reviews.routes.js")(app);
require("./routes/customer.routes.js")(app);
require("./routes/voucher.routes.js")(app);
require("./routes/room.routes.js")(app);
require("./routes/orders.routes.js")(app);
require("./routes/room_service.routes.js")(app);
require("./routes/room_image.routes.js")(app);
app.use("/api/facilities", facilitiesRoutes);

cron.schedule('0 0 */12 * *', () => {
  cronJobUpdateShow()
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh'
})

cron.schedule('1 0 */12 * *', () => {
  updateVoucherCronJob_2()
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh'
});

// set port, listen for requests
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
