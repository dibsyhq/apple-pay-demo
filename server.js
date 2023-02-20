const express = require('express')
const axios = require('axios')
const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 4545

app.use(express.static('public'))
app.use(express.json())

// CREATE A PAYMENT SESSION

app.post('/payments/applepay/session', async (req, res) => {
  try {
    const options = {
      domain: process.env.DOMAIN,
      validationUrl:
        'https://apple-pay-gateway.apple.com/paymentservices/paymentSession',
    }

    const response = await axios.post(
      'https://api.dibsy.one/v2/wallets/applepay/session',
      JSON.stringify(options),
      {
        headers: {
          Authorization: 'Bearer ' + process.env.DIBSY_API_SECRET_KEY,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('response', response.data)

    res.send(response?.data)
  } catch (error) {
    console.log(error.response.data)
  }
})

// PROCESS PAYMENT TOKEN

app.post('/payments/applepay/tokens', async (req, res) => {
  const token = req?.body
  console.log('token', token)

  const opts = {
    method: 'applepay',
    amount: {
      value: '1.00',
      currency: 'QAR',
    },
    description: 'Order #100001',
    metadata: {
      orderId: '100001',
      customerId: '100',
      device: 'iOS',
    },
    redirectUrl: 'https://example.com',
    applePayToken: JSON.stringify(token),
  }

  try {
    const response = await axios.post(
      'https://api.dibsy.one/v2/payments',
      opts,
      {
        headers: {
          Authorization: 'Bearer ' + process.env.DIBSY_API_SECRET_KEY,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('response', response.data)

    if (response?.data?.status === 'succeeded') {
      res.sendStatus(200)
    } else {
      res.sendStatus(400)
    }
  } catch (error) {
    console.log('error', error.response.data)
    res.sendStatus(400)
  }
})

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`))
