var aws = require('aws-sdk');
var lambda = new aws.Lambda({ region: 'us-west-2' });

exports.handler = async (event, context) => {
  lambda.invoke({
    FunctionName: 'lambda_in_pipeline:prod',
    Payload: JSON.stringify(event, null, 2) // pass params
  }, function(error, data) {
    if (error) {
      context.done('error', error);
    }
    if(data.Payload){
    context.succeed(data.Payload)
    }
  });
}