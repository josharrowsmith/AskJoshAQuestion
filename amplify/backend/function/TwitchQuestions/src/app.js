var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')
var expressJwt  = require('express-jwt')
const fetch = require('node-fetch');
var jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4');
const tableName = "TwitchQuestions-dev"
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
const secret = Buffer.from('', 'base64');

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
  console.log(req);
  let put = await postQuestion(req.body);
  let token = await getToken(req)
  let twitchpubsubPost = await postToTwitchPubSub("newquestion", token, "73628599", "");
  console.log(twitchpubsubPost)
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

const getToken = async (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
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

const postToTwitchPubSub = async(na, token, channelId, clientId) => {
  // use twitch pubsub 
  console.log("hey im running")
  const message = "fuck you"
    await fetch(`https://api.twitch.tv/extensions/message/${channelId}`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': clientId,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          content_type: 'application/json',
          message: message,
          targets: ['broadcast']
      })
  })
      .then(response => response.json())
      .then(response => {
          console.log("pub", response);
      })
      .catch(err => { console.log("pub",err) });
}


const makeServerToken = async(channelId, userId) => {
  const payload = {
      exp: Math.floor(Date.now() / 1000) + 30,
      channel_id: channelId.toString(),
      user_id: userId.toString(),
      role: 'external',
      pubsub_perms: {
          send: ['broadcast']
      }
  };
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}



app.listen(3000, function() {
    console.log("App started")
});

module.exports = app