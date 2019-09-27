import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Pipeline = require('../lib/pipeline-stack');
import { LambdaStack } from '../lib/lambda-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const lambdaStack = new LambdaStack(app, 'MyTestLambdaStack');
    const stack = new Pipeline.PipelineStack(app, 'MyTestStack', { lambdaCode: lambdaStack.lambdaCode});
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});