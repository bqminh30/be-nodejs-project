require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
var cron = require("node-cron");
const paypal = require("paypal-rest-sdk");
const app = express();
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")("sk_test_...");
const { apiPublicKey, apiSecretKey } = require("./app/config/config.js");

const facilitiesRoutes = require("./app/routes/facilities.routes.js");
const { updateVoucherCronJob_2 } = require("./app/models/room.model.js");
const { cronJobUpdateShow } = require("./app/models/voucher.model.js");

var corsOptions = {
  origin: [
    "http://localhost:8080",
    "https://center-marriott-booking.vercel.app",
    "*",
  ],

  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "Acznkr8xl6vXd6E9vCIP9WGdTToq4BnzBjerQ1DObiYCJfp7yMO11RdpkRcqOCGm-Y1RAoTiPwPTIwYn",
  client_secret:
    "EHLgb25ODJJC_jgB0IdxtoBI1f7ggS7ho3ZoXAhn078clhQLu9s7apppoqZynL4wJlojKcjTlL-EzRoN",
});

// access_token
// A21AAJgOYBLrMe65FcUKp5vpqBxEYdnA0cLQTiWhj89LZyL2btlmxDKgXIWoHqmzw0vNEL5HqVErwaluEpzPvVM0R-iPc3DcQ

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
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

cron.schedule(
  "0 0 */12 * *",
  () => {
    cronJobUpdateShow();
  },
  {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

cron.schedule(
  "1 0 */12 * *",
  () => {
    updateVoucherCronJob_2();
  },
  {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

app.post("/api/v1/initialize-transaction", async (req, res) => {
  try {
    const {
      amount,
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      reference,
      email,
      currency,
    } = req.body;

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

app.get("/create", function (req, res) {
  console.log('req,', req.body)
  //build PayPal payment request
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://be-nodejs-project.vercel.app/process",
      cancel_url: "https://be-nodejs-project.vercel.app/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Redhock Bar Soap",
              sku: "001",
              price: "25.00",
              currency: "USD",
              quantity: 1,
            },
            {
              name: "Redhock Bar Soap 2",
              sku: "002",
              price: "30.00",
              currency: "USD",
              quantity: 2,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "85.00",
        },
        description: "Washing Bar soap",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/process", function (req, res) {
  var paymentId = req.query.paymentId;
  var payerId = { payer_id: req.query.PayerID };

  paypal.payment.execute(paymentId, payerId, function (error, payment) {
    if (error) {
      console.error(error);
    } else {
      console.log("payment", payment);
      if (payment.state == "approved") {
        res.status(200).json({ success: true });
      } else {
        res.status(200).json({ success: false });
      }
    }
  });
});
app.get("/cancel", (req, res) => {
  res.status(200).json({ success: false });
});
// set port, listen for requests
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
