// @ts-check
'use strict';

var aws = require('aws-sdk');
var lambda = new aws.Lambda({ region: 'sa-east-1' });

exports.handler = (event, context) => {
  lambda.invoke({
    FunctionName: 'lambda_in_pipeline',
    Qualifier: 'prod',
    Payload: JSON.stringify(event, null, 2) // pass params
  }, function(error, data) {
    if (error) {
      console.log(JSON.stringify(error));
      context.done('error', error);
    }
    if(data.Payload){
      console.log(JSON.stringify(data.Payload))
      context.succeed(data.Payload);
    }
  });
}