// @ts-check
'use strict';

const aws = require('aws-sdk');
const codedeploy = new aws.CodeDeploy({apiVersion: '2014-10-06'});

exports.handler = async (event, context, callback) => {

    console.log("Entering PreTraffic Hook!");
    console.log(JSON.stringify(event));

    //Read the DeploymentId from the event payload.
    let deploymentId = event.DeploymentId;
    console.log("deploymentId=" + deploymentId);

    //Read the LifecycleEventHookExecutionId from the event payload
    let lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
    console.log("lifecycleEventHookExecutionId=" + lifecycleEventHookExecutionId);

    // Simulating running a unit test
    for (let index = 0; index < 10; index++) {
      console.log("Simulating running a unit test: " + index);
    }

    // Prepare the validation test results with the deploymentId and
    // the lifecycleEventHookExecutionId for AWS CodeDeploy.
    let params = {
        deploymentId: deploymentId,
        lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
        status: 'Succeeded' // status can be 'Succeeded' or 'Failed'
    };

    try {
      await codedeploy.putLifecycleEventHookExecutionStatus(params).promise();

      // This code is executed if the status is "succeeded".
      console.log("putLifecycleEventHookExecutionStatus done. executionStatus=[" + params.status + "]");
      return '(Simulated) Validation unit test status was: ' + params.status
    }
    catch (err) {
      console.log("putLifecycleEventHookExecutionStatus ERROR: " + err);
      throw new Error('(Simulated) Validation unit test failed')
    }

}
