#!/usr/bin/env node
import 'source-map-support/register';
import {App} from '@aws-cdk/core'
import { PipelineStack } from '../lib/pipeline-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new App();
const lambdaStack = new LambdaStack(app, 'LambdaStack')
new PipelineStack(app, 'PipelineDeployingLambdaStack', {
  lambdaCode: lambdaStack.lambdaCode,
});

app.synth();