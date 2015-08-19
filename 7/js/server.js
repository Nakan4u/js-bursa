/**
 * Created by nakan on 08.07.15.
 */
var http = require('http');
var url = require('url');
var qs = require('querystring');

var data = [
  { id: '1', name: 'Illya Klymov', phone: '+380504020799', role: 'Administrator' },
  { id: '2', name: 'Ivanov Ivan', phone: '+380670000002', role: 'Student', strikes: 1 },
  { id: '3', name: 'Petrov Petr', phone: '+380670000001', role: 'Support', location: 'Kiev' }
];

function setHeaders(obj, code) {
  obj.writeHead(code, {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,POST,DELETE',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
}
function findUserById(id) {
  var result;
  var i;
  for (i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      console.log('founded item id is ' + data[i].id);
      result = data[i];
      break;
    }
  }
  return result;
}
function removeUser(id) {
  var result;
  var i;
  for (i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      console.log('deleted item id is ' + data[i].id);
      data.splice(i, 1);
      result = id;
      break;
    }
  }
  console.log(data);
  return result;
}
function saveData(newData) {
  console.log('in save step');
  newData.id = (data.length + 1).toString();
  if (!newData.role || newData.role === undefined) {
    newData.role = 'Student';
  }
  console.log(newData);
  data.push(newData);
  console.log(data);
}
function getPostData() {
  var postData = {};
  postData.role = 'Student';
  postData.id = (data.length + 1);
  return postData;
}
function changeData(userId, newData) {
  var userData = findUserById(userId) || 0;
  if (userData) {
    userData.name = newData.name;
    userData.phone = newData.phone;
    if (!userData.role || userData.role === undefined) {
      userData = 0;
    } else if (userData.role === 'Administrator' || userData.role === 'Admin') {
      console.log('user found he is admin:');
    } else if (userData.role === 'Support') {
      console.log('user found he is support:');
      //userData.role = 'Support';
      userData.location = newData.location || '';
    } else if (userData.role === 'Student') {
      console.log('user found he is student:');
      //userData.role = 'Student';
      userData.strikes = newData.strikes || '';
    } else {
      console.log('unefined type of user');
      userData.role = '';
    }
  }
  return userData;
}

var server = http.createServer(function(req, res) {
  var parsedUrl = url.parse(req.url);
  var newData;
  var userId;
  var i;

  if (req.headers.hasOwnProperty('content-type') && req.headers['content-type'] !== 'application/json') {
    res.writeHead(401);
    res.end('bad request 401');
    console.log('401');
  } else if (req.method === 'OPTIONS') {
    setHeaders(res, 204);
    res.end();
  } else if (req.method === 'GET') {
    if (parsedUrl === '/api/users/refreshAdmins') {
      setHeaders(res, 200);
      res.end();
    } else {
      var sendData = JSON.stringify(data);
      setHeaders(res, 200);
      res.end(sendData);
    }
  } else if (req.method === 'POST') {

    console.log('used post');

    req.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      newData = JSON.parse(chunk);
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    req.on('end', function () {

      console.log(newData);
      var postData = JSON.stringify(getPostData());
      console.log('my send data is ' + postData);
      saveData(newData);

      // use post
      setHeaders(res, 200);
      res.write(postData);
      res.end();
    });
  } else if (req.method === 'PUT') {

    console.log('used put');

    req.on('data', function (chunk) {
      newData = '';
      console.log('BODY: ' + chunk);
      newData = JSON.parse(chunk);
    });

    req.on('end', function () {
      userId = parsedUrl.path.split('/api/users/')[1];
      newData.id = userId.toString();

      if (changeData(userId, newData)) {
        setHeaders(res, 204);
      } else {
        setHeaders(res, 404);
      }
      res.end();
      console.log(data);
    });
  } else if (req.method === 'DELETE') {

    userId = parsedUrl.path.split('/api/users/')[1];
    console.log('used delete');

    req.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
      newData = JSON.parse(chunk);
    });

    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });

    req.on('end', function () {
      //console.log(data);
      console.log(userId);
      if (findUserById(userId)) {
        removeUser(userId);
        setHeaders(res, 204);
        console.log('delete ok');
      } else {
        setHeaders(res, 404);
      }
      res.end();
      //console.log(data);
    });
  } else {
    console.log('unexpected error');
    res.end();
  }
});


if (module.parent) { module.exports = server } else { server.listen(20007); }