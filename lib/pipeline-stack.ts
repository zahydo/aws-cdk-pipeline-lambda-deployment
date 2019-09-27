import { App, Stack, StackProps } from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import codecommit = require('@aws-cdk/aws-codecommit');
import codedeploy = require('@aws-cdk/aws-codedeploy');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import s3 = require('@aws-cdk/aws-s3');

// we define a new props interface for it, PipelineStackProps. 
// This extends the standard StackProps, and use it in its constructor signature. 
// This is how clients of this class pass the Lambda code that the class needs.
export interface PipelineStackProps extends StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);

    const code = codecommit.Repository.fromRepositoryName(this, 'ImportedRepo', 'hello-world-lambda-function');
    // The code that defines your stack goes here
  }
}
