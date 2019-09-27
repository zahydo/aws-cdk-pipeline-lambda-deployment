import { App, Stack, StackProps } from '@aws-cdk/core';
import codedeploy = require('@aws-cdk/aws-codedeploy');
import lambda = require('@aws-cdk/aws-lambda');
import api = require('@aws-cdk/aws-apigateway');


export class LambdaStack extends Stack {
  // This property represents the code that is supplied later by the pipeline. 
  // Because the pipeline needs access to the object, we expose it as a public, read-only property on our class.
  public readonly lambdaCode: lambda.CfnParametersCode;
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);

    this.lambdaCode = lambda.Code.cfnParameters();

    const func = new lambda.Function(this, 'Lambda', {
      code: this.lambdaCode,
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_8_10,
      functionName: 'lambda_in_pipeline'
    });
    
    const version = func.addVersion(new Date().toISOString());
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Production',
      version: version,
    });

    new api.LambdaRestApi(this, 'LambdaRestApi', {
      handler: func
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias: alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
      deploymentGroupName: 'LambdaDeploymentGroup'
    });
  }
}
