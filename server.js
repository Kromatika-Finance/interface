/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require('qs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Joi = require('joi')
const app = express()
var cors = require('cors')

app.use(express.json())
app.use(cors())

function validateRequest(req, next, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  }
  // maybe create dto object
  const { error, value } = schema.validate(req.query, options)
  if (error) {
    next(`Validation error: ${error.details.map((x) => x.message).join(', ')}`)
  } else {
    req.body = value
    next()
  }
}

function checkParameters(req, res, next) {
  const schema = Joi.object({
    fromTokenAddress: Joi.string().required(),
    toTokenAddress: Joi.string().required(),
    amount: Joi.required(),
    fromAddress: Joi.string().required(),
    slippage: Joi.required(),
  })

  validateRequest(req, next, schema)
}

async function get1InchQuote(obj) {
  const queryString = {
    fromTokenAddress: obj.fromTokenAddress,
    toTokenAddress: obj.toTokenAddress,
    amount: obj.amount,
    fromAddress: obj.fromAddress,
    slippage: obj.slippage,
  }
  let response = ''
  try {
    response = await axios.get('https://api.1inch.io/v4.0/1/quote?' + qs.stringify(queryString)) // adjust per chain
  } catch (exception) {
    console.log('exeception: ', exception.message)
  }

  return response.data
}

async function getZeroXQuote(obj) {
  const queryString = {
    sellToken: obj.fromTokenAddress,
    buyToken: obj.toTokenAddress,
    sellAmount: obj.amount,
    slippagePercentage: obj.slippage,
  }
  let r = ''
  try {
    r = await axios.get('https://api.0x.org/swap/v1/quote?' + qs.stringify(queryString)) // adjust per chain
  } catch (exception) {
    console.log('exception: ', exception.message)
  }
  return r.data
}

async function compareRoutes(oneInch, zeroX) {
  if (oneInch && zeroX && oneInch.toTokenAmount > zeroX.buyAmount) return oneInch

  if (oneInch && zeroX && zeroX.buyAmount > oneInch.toTokenAmount) return zeroX

  if (oneInch && zeroX && zeroX.estimatedGas > oneInch.estimatedGas) return oneInch

  return zeroX
}

async function getBestQuote(obj) {
  const zeroXQuote = await getZeroXQuote(obj)

  if (obj && obj.outputSpecified) return zeroXQuote // inspect this case

  const oneInchQuote = await get1InchQuote(obj)

  return await compareRoutes(oneInchQuote, zeroXQuote)
}

app.get('/getSwap', checkParameters, async (req, res, next) => {
  const data = await getBestQuote(req.query)
  // should also fetch uniswap price, so you could fetch the savings

  if (data == undefined) res.status(500).send('Server Error')
  else res.send(data)
})

app.listen(4000)
