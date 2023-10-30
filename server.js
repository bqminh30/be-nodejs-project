

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const path = require("path");
const app = express();
const facilitiesRoutes = require("./app/routes/facilities.routes");
const apiRouter = express.Router();

const cloudinary = require("cloudinary").v2;

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
require("./app/routes/room_image.routes.js")(app);
app.use("/api/facilities", facilitiesRoutes);

app.post("/delete-image",async (req, res) => {
  await cloudinary.uploader
  .destroy('pikcrssd0fhjlo3oj57q',
  {
    invalidate: true
  },
  function(error, result){console.log(result, ' err', error);})
})

// set port, listen for requests
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
