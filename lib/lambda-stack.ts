import { App, Stack, StackProps } from '@aws-cdk/core';
import codedeploy = require('@aws-cdk/aws-codedeploy');
import lambda = require('@aws-cdk/aws-lambda');
import api = require('@aws-cdk/aws-apigateway');
// import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import iam = require('@aws-cdk/aws-iam');
import { PolicyStatement } from '@aws-cdk/aws-iam';


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
      runtime: lambda.Runtime.NODEJS_10_X,
      functionName: 'lambda_in_pipeline',
    });
    
    const version = func.addVersion(new Date().toISOString());
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Production',
      version: version,
    });

    const preHook = new lambda.Function(this, 'PreHook', {
      code: this.lambdaCode,
      handler: 'prehook.handler',
      runtime: lambda.Runtime.NODEJS_8_10,
      functionName: 'prehook_in_pipeline',
      // initialPolicy: [
      //   new PolicyStatement({
      //     effect: iam.Effect.ALLOW, 
      //     actions: ['codedeploy:PutLifecycleEventHookExecutionStatus'], 
      //     resources: ['*'],
      //   }),
      //   new PolicyStatement({
      //     effect: iam.Effect.ALLOW, 
      //     actions: ['lambda:InvokeFunction'], 
      //     resources: ['*']
      //   })
      // ],
      // environment: {
      //   CurrentVersion: version.toString()
      // }
    });

    preHook.addToRolePolicy(new PolicyStatement({
      effect: iam.Effect.ALLOW, 
      actions: ['codedeploy:PutLifecycleEventHookExecutionStatus',
        'iam:PassRole',
        'ec2:CreateTags',
        'ec2:RunInstances'], 
      resources: ['*'],
    }));
    preHook.addToRolePolicy(new PolicyStatement({
      effect: iam.Effect.ALLOW, 
      actions: ['lambda:InvokeFunction'], 
      resources: [func.functionArn],
    }));

    new api.LambdaRestApi(this, 'LambdaRestApi', {
      handler: func
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias: alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      deploymentGroupName: 'LambdaDeploymentGroup',
      preHook: preHook,
    });
  }
}
