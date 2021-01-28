/* Amplify Params - DO NOT EDIT
	API_TWITCHQUESTIONS_APIID
	API_TWITCHQUESTIONS_APINAME
	ENV
	REGION
	STORAGE_TWITCHQUESTIONS_ARN
	STORAGE_TWITCHQUESTIONS_NAME
Amplify Params - DO NOT EDIT */var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')
const tableName = "TwitchQuestions-dev"
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next()
});

app.get('/channelquestions', async (req, res) => {
  // get list of all channel questions
  console.log(req.query.channel_id)
  let data2 = await getChannelQuestions(req.query.channel_id);
  res.json(data2);
});

app.get('/questions', async (req, res) => {
  // get list of all questions
  let questions = await getQuestions(req.query.user_id);
  res.json(questions);
});

app.post('/question', async (req, res) => {
  // post a question
  res.json({success: 'alright', url: req.url, body: req.body})
});

const getChannelQuestions = async (channelid) => {
  var params2 = {
    ExpressionAttributeValues: { ":channelId":  channelid}, 
    KeyConditionExpression: "channel_id = :channelId", 
    IndexName: "channel_id-index",
    TableName: tableName
   };

  try {
    let data3 = await docClient.query(params2).promise();
    return data3;
  } catch (err) {
    console.log(err)
  }
}

const getQuestions = async (userid) => {
  var params = {
    ExpressionAttributeValues: { ":userId":  userid}, 
    KeyConditionExpression: "user_id = :userId",
    TableName: tableName
   };

  try {
    let data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.log(err)
  }
}



app.listen(3000, function() {
    console.log("App started")
});

module.exports = app
