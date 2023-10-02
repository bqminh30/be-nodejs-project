require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const path = require("path");
const app = express();
const facilitiesRoutes = require("./app/routes/facilities.routes");
const roomImagesRoutes = require("./app/routes/room_image.routes");
const apiRouter = express.Router();
const cloudinary = require("cloudinary").v2;

var corsOptions = {
  origin: "http://localhost:8080",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use(cors(corsOptions));
app.use(cookieParser());
// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({ extended: true })
); /* bodyParser.urlencoded() is deprecated */
app.use("/upload", express.static("public/images"));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to server." });
});

require("./app/routes/typeroom.routes.js")(app);
require("./app/routes/typeservice.routes.js")(app);
require("./app/routes/service.routes.js")(app);
require("./app/routes/employee.routes.js")(app);
require("./app/routes/reviews.routes.js")(app);
require("./app/routes/customer.routes.js")(app);
require("./app/routes/voucher.routes.js")(app);
require("./app/routes/room.routes.js")(app);
require("./app/routes/orders.routes.js")(app);
require("./app/routes/room_service.routes.js")(app);
app.use("/api/facilities", facilitiesRoutes);
app.use("/api/room-image", roomImagesRoutes);

// set port, listen for requests
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
