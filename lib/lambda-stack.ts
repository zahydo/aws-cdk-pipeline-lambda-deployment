import { App, Stack, StackProps } from '@aws-cdk/core';
import codedeploy = require('@aws-cdk/aws-codedeploy');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import { LambdaRestApi } from '@aws-cdk/aws-apigateway';


export class LambdaStack extends Stack {
  // This property represents the code that is supplied later by the pipeline. 
  // Because the pipeline needs access to the object, we expose it as a public, read-only property on our class.
  public readonly lambdaCode: lambda.CfnParametersCode;
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);
    let lambdaVersion = '8', aliasName = 'prod';
    // These parameters come from the PipelineDeploymentStack
    this.lambdaCode = lambda.Code.cfnParameters();
    const myApplication = new codedeploy.LambdaApplication(this, 'LambdaApplication', {
      applicationName: 'lambda_application_in_pipeline'
    });
    // Main lambda Function
    const handler = new lambda.Function(this, 'Lambda', {
      code: this.lambdaCode,
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      functionName: 'lambda_in_pipeline',
    });
    // Version and Alias to manage traffic shiffting
    const version = handler.addVersion(lambdaVersion);
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: aliasName,
      version
    });
    // Lambda function to execute before traffic shiffting
    const preHook = new lambda.Function(this, 'PreHook', {
      code: this.lambdaCode,
      handler: 'prehook.handler',
      runtime: lambda.Runtime.NODEJS_8_10,
      functionName: 'prehook_in_pipeline',
      environment: {
        CurrentVersion: version.toString()
      }
    });
    // LamdaDeploymentGroup to manage the deployment type (Blue/Green), put alarms and run pre and post hooks functions
    new codedeploy.LambdaDeploymentGroup(this, 'LambdaDeploymentGroup', {
      alias,
      application: myApplication,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      deploymentGroupName: 'Lambda_deployment_group',
      preHook: preHook,
      alarms: [
        // pass some alarms when constructing the deployment group
        new cloudwatch.Alarm(this, 'ErrorsAlarm', {
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
          threshold: 1,
          evaluationPeriods: 1,
          metric: alias.metricErrors(),
          alarmName: 'errors_alarm_in_pipeline'
        })
      ]
    });

    // ApiGateway to test lambda function
    const api = new apigateway.RestApi(this, 'RestApi', {
      restApiName: 'lambda_rest_api',
    });
    const getLambdaIntegration = new apigateway.LambdaIntegration(handler);
    api.root.addMethod("GET", getLambdaIntegration);
  }
}
