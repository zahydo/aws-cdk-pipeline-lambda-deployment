// @ts-check
'use strict';

var aws = require('aws-sdk');
var lambda = new aws.Lambda({ region: 'sa-east-1' });
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property
// https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
// Invoke lambda function synchronously and make callback
exports.handler = (event, context, callback) => {
  lambda.invoke({
    FunctionName: 'lambda_in_pipeline',
    Qualifier: 'prod',
    Payload: JSON.stringify(event)
  }, function(err, data) {
    if (err) {
      callback(err);
    }
    if(data.Payload){
      callback(null, JSON.parse(data.Payload.toString()));
    }
  });
}