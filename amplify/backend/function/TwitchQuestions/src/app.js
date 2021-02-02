var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')
var jwt = require('express-jwt')
const uuidv4 = require('uuid/v4');
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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next()
});

app.get('/channelquestions', async (req, res) => {
  // get list of all channel questions
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
  console.log(req.body);
  let put = await postQuestion(req.body);
  res.json(put);
});

app.put('/answer', async (req, res) => {
  // put a answer
  console.log(req.body)
  let answer = await updateQuestionAnswer(req.body);
  res.json(answer);
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
    IndexName: "user_id-index",
    TableName: tableName
   };

  try {
    let data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.log(err)
  }
}

const postQuestion = async(questionBody) => {
  console.log(questionBody);
  const { user_id, channel_id, question, postedToForum, displayName } = questionBody;
  const id = uuidv4(); 
  var params = {
    TableName: tableName,
    Item: {
      id, user_id, channel_id, question, postedToForum, displayName
    }
  }

  try{
    let data = await docClient.put(params).promise();
    console.log(data);
    return data;
  } catch(error) {
      return error;

  }

}

const updateQuestionAnswer = async(question) => {
  var params = {
    TableName:tableName,
    Key:{
        "id": question.id
    },
    UpdateExpression: "set answer=:answer",
    ExpressionAttributeValues:{
        ":answer": question.answer
    },
    ReturnValues:"UPDATED_NEW"
  };

  try{
    let data = await docClient.update(params).promise();
    console.log(data);
    return data;
  } catch(error) {
      return error;
  }
}



app.listen(3000, function() {
    console.log("App started")
});

module.exports = app