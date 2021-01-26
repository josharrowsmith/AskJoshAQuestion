var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
const tableName = '';

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

app.get('/questions', function(req, res) {
  // get list of all questions
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/question', function(req, res) {
  // post a question
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.listen(3000, function() {
    console.log("App started")
});

module.exports = app
