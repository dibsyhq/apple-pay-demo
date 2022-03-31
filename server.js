const express = require("express");
const axios = require("axios");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 4545;

app.use(express.static("public"));
app.use(express.json());

// CREATE A PAYMENT SESSION

app.post("/payments/applepay/session", async (req, res) => {
  try {
    const options = {
      "domain": "4379-37-186-50-252.ngrok.io",
      "validationUrl": "https://apple-pay-gateway.apple.com/paymentservices/paymentSession"
    };

    const response = await axios.post(
      'https://api.dibsy.one/v2/wallets/applepay/session',
      JSON.stringify(options),
      {
        headers: {
          'Authorization': 'Bearer sk_live_a4b69994f53bb422124198991d8501eeb38b',
          "Content-Type": "application/json",
        }
      }
    );

    console.log('response', response.data);

    res.send(response?.data);

  } catch (error) {
    console.log(error.response.data)
  }
});

// PROCESS PAYMENT TOKEN 

app.post("/payments/applepay/tokens", async (req, res) => {

  const token = req?.body;
  console.log('token', token)

  const opts = {
    "method": "applepay",
    "amount":{
      "value": '1.00',
      "currency": "QAR"
    },
    "description": "Test",
    "redirectUrl": "https://example.com",
    "applePayToken": JSON.stringify(token),
  }

  try {


    // start timer 
    const start = new Date().getTime();
    const response = await axios.post(
      'https://api.dibsy.one/v2/payments',
      opts,
      {
        headers: {
          'Authorization': 'Bearer sk_live_a4b69994f53bb422124198991d8501eeb38b',
          "Content-Type": "application/json",
        }
      }
    );

    console.log('response', response.data)

    if (response?.data?.status === "succeeded") {
      // calculate time taken
      const end = new Date().getTime();
      const time = end - start;
      console.log('time', time)
      res.sendStatus(200)
    }
    else {
      res.sendStatus(400)
    }
    
  } catch (error) {
    console.log('error', error.response.data)
    res.sendStatus(400)
  }


});



app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`));