/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express');
var app = express();
var watson = require('watson-developer-cloud');
var TwitterHelper = require('./twitter-helper');
var config = require('./config');

// Bootstrap application settings
require('./config/express')(app);


var twitterHelper = new TwitterHelper(config.twitter);

var personalityInsights = watson.personality_insights({
  version: 'v2',
  username: '<username>',
  password: '<password>'
});

var toneAnalyzer = watson.tone_analyzer({
  version: 'v1',
  username: '<username>',
  password: '<password>'
});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/profile', function(req, res, next) {
  twitterHelper.showUser(req.query.username,function(err){
    if (err)
      return next(err);

    twitterHelper.getTweets(req.query.username,function(err, tweets){
      if (err)
        return next(err);

      personalityInsights.profile({contentItems:tweets}, function(err, results) {
        if (err)
          return next(err);
        else
          return res.json(results);
      });
    });
  });
});

app.post('/tone', function(req, res, next) {
  // get the message tone
  toneAnalyzer.tone(req.body, function(err, results) {
    if (err)
      return next(err);
    else
      return res.json(results);
  });
});

app.post('/synonym', function(req, res, next) {
  // get the message tone
  toneAnalyzer.synonym(req.body, function(err, results) {
    if (err)
      return next(err);
    else
      return res.json(results);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  var error = {
    code: err.statusCode || err.code || 500,
    error: err.message || error.error
  };
  res.status(error.code).json(error);
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
