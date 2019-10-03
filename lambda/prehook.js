// @ts-check
'use strict';

const aws = require('aws-sdk');
const codedeploy = new aws.CodeDeploy({apiVersion: '2014-10-06'});

exports.handler = (event, context, callback) => {
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

  // Pass AWS CodeDeploy the prepared validation test results (Simulated).
  codedeploy.putLifecycleEventHookExecutionStatus(params, function(err, data) {
    console.log(JSON.stringify(data));
    let event_result = 'Validation test ' + params.status;
    console.log(event_result);
    if (err) {
      // (Simulated) Validation failed.
      callback(event_result);
    } else {
      // (Simulated) Validation succeeded.
      callback(null, event_result);
    }
  });
}
