// @ts-check
'use strict';

var aws = require('aws-sdk');
var lambda = new aws.Lambda({ region: 'sa-east-1' });

exports.handler = (event, context, callback) => {
  lambda.invoke({
    FunctionName: 'lambda_in_pipeline',
    Qualifier: 'prod',
    Payload: JSON.stringify(event) // pass params
  }, function(err, data) {
    if (err) {
      context.done('error', err);
    }
    if(data.Payload){
      context.succeed(data.Payload);
    }
  });
}