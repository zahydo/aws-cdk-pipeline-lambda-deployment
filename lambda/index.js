/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.handler = async (event, context) => {
  var aws = require('aws-sdk');
  var lambda = new aws.Lambda({
    region: 'us-west-2' //change to your region
  });

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
  // let response;
  // try {
  //   response = {
  //     'statusCode': 201,
  //     'body': JSON.stringify({
  //       message: 'hello world, this is the fourth version  ' + event.headers.Host,
  //       version: '11'
  //     })
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return err;
  // }
  // return response
};
