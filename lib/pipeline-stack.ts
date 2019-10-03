import { App, Stack, StackProps } from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import codecommit = require('@aws-cdk/aws-codecommit');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import s3 = require('@aws-cdk/aws-s3');

// we define a new props interface for it, PipelineStackProps.
// This extends the standard StackProps, and use it in its constructor signature.
// This is how clients of this class pass the Lambda code that the class needs.
export interface PipelineStackProps extends StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props: PipelineStackProps) {
    super(app, id, props);

    // Downloaded code from codecommit repository by the name
    const code = codecommit.Repository.fromRepositoryName(this, 'ImportedRepo', 'hello-world-lambda-function');
    // CodeBuild projects to run node and CDK commands, when the code change in the pipeline
    const cdkBuild = new codebuild.PipelineProject(this, 'CdkBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        "version": "0.2",
        "phases": {
          "install": {
            "commands": [
              "npm install"
            ]
          },
          "build": {
            "commands": [
              "npm run build",
              "npm run cdk synth -- -o dist"
            ]
          }
        },
        "artifacts": {
          "base-directory": "dist",
          "files": [
            "LambdaStack.template.json"
          ]
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
      },
      projectName: 'CdkBuild',
    });
    const lambdaBuild = new codebuild.PipelineProject(this, 'LambdaBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        "version": "0.2",
        "phases": {
          "install": {
            "commands": [
              "cd lambda",
              "npm install"
            ]
          },
          "build": {
            "commands": [
              "npm run build"
            ]
          }
        },
        "artifacts": {
          "base-directory": "lambda",
          "files": [
            "index.js",
            "prehook.js",
            "node_modules/**/*"
          ]
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
      },
      projectName: 'LambdaBuild'
    });
    // Artifacts to execute the different Pipeline stages
    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');
    const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');
    // Pipeline to deploy any change in the CDK and Lambda code
    new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'PipelineLambdaDeploymentSample',
      artifactBucket: new s3.Bucket(this, 'PipelineBucket', {bucketName: 'aws-bucket-for-pipeline-lambda-sample'}),
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeCommitSourceAction({
              actionName: 'CodeCommit_source',
              repository: code,
              output: sourceOutput
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Lambda_Build',
              project: lambdaBuild,
              input: sourceOutput,
              outputs: [lambdaBuildOutput],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CDK_Build',
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Lambda_Deploy',
              templatePath: cdkBuildOutput.atPath('LambdaStack.template.json'),
              stackName: 'LambdaDeploymentStack2',
              adminPermissions: true,
              parameterOverrides: {
                ...props.lambdaCode.assign(lambdaBuildOutput.s3Location),
              },
              extraInputs: [lambdaBuildOutput],
            }),
          ],
        },
      ],
    });
  }
}
