

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); 
const cors = require("cors");
const axios = require('axios');
var cron = require('node-cron');
const paypal = require('paypal-rest-sdk');
const app = express();
const cloudinary = require("cloudinary").v2;
const { apiPublicKey, apiSecretKey } = require('./app/config/config.js');


const facilitiesRoutes = require("./app/routes/facilities.routes.js");
const {updateVoucherCronJob_2} = require('./app/models/room.model.js')
const {cronJobUpdateShow} = require('./app/models/voucher.model.js')


var corsOptions = {
  origin: ["http://localhost:8080", "https://center-marriott-booking.vercel.app", "*"],
  
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AaRTEM6WAhaRMH_90zLF6-NWPurmwTscLrkjplrnSPuEBO_Wy2jQ0TaIctf2feIF9k5L7ikQokShpdh6',
  'client_secret': 'ENbUna3-27VZjPfr5wjL5WVUf8BoIiFt8G5VV8D22Z4zeZuTZtQo4BY1LVXIIcyCtV3l0Z7KLtygaJpj'
});

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

app.post("/api/v1/initialize-transaction", async (req, res) => {
  try {
    const { amount, cardNumber, cardExpMonth, cardExpYear, cardCvv, reference, email, currency } = req.body;

    const response = await axios.post(
      "https://api.budpay.com/api/v2/transaction/initialize",
      {
        amount,
        cardNumber,
        cardExpMonth,
        cardExpYear,
        cardCvv,
        reference,
        email,
        currency,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiPublicKey,
          "X-API-Secret": apiSecretKey,
        },
      }
    );

    if (response.data.success) {
      res.json({ success: true, message: "Payment successful!" });
    } else {
      res.json({ success: false, message: "Payment failed." });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the payment.",
    });
  }
});

app.get('/create', function(req, res){
  //build PayPal payment request
  var payReq = JSON.stringify({
      'intent':'sale',
      'redirect_urls':{
          'return_url':'https://be-nodejs-project.vercel.app/process',
          'cancel_url':'https://be-nodejs-project.vercel.app/cancel'
      },
      'payer':{
          'payment_method':'paypal'
      },
      'transactions':[{
          'amount':{
              'total':'7.47',
              'currency':'USD'
          },
          'description':'This is the payment transaction description.'
      }]
  });

  paypal.payment.create(payReq, function(error, payment){
      if(error){
          console.error(error);
      } else {
          //capture HATEOAS links
          var links = {};
          payment.links.forEach(function(linkObj){
              links[linkObj.rel] = {
                  'href': linkObj.href,
                  'method': linkObj.method
              };
          })
      
          //if redirect url present, redirect user
          if (links.hasOwnProperty('approval_url')){
              res.redirect(links['approval_url'].href);
          } else {
              console.error('no redirect URI present');
          }
      }
  });
});

app.get('/process', function(req, res){
  var paymentId = req.query.paymentId;
  var payerId = { 'payer_id': req.query.PayerID };

  paypal.payment.execute(paymentId, payerId, function(error, payment){
      if(error){
          console.error(error);
      } else {
          if (payment.state == 'approved'){ 
              res.send('payment completed successfully');
          } else {
              res.send('payment not successful');
          }
      }
  });
});
// set port, listen for requests
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
