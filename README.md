# CDK MERN MIGRATED APP

_Infrastructure as code framework used_: AWS CDK
_AWS Services used_: AWS Lambda, AWS Amplify, Amazon Cognito, AWS S3, Amazon CloudFront, Amazon CloudWatch

## Summary of the demo

In this demo you will see how to migrate an existing MERN application to serverless using AWS Lambda

This demo is part of a video posted in FooBar Serverless channel. You can check the video to see the whole demo.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the AWS Pricing page for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## Requirements

- AWS CLI already configured with Administrator permission
- AWS CDK - v2
- NodeJS 16.x installed
- CDK bootstrapped in your account

## Deploy this demo

Deploy the project to the cloud:

```
cdk synth
cdk deploy
```

When asked about functions that may not have authorization defined, answer (y)es. The access to those functions will be open to anyone, so keep the app deployed only for the time you need this demo running.

To delete the app:

```
cdk destroy
```

## Links related to this code

- [Is lift and shift migration Lambda possible? Demo with Node-Express app](https://youtu.be/MvVaFPCdiZY)
- [Migrate your ReactJS app to Serverless - Lift and shift your frontend](https://youtu.be/gQn4XPfpdZE)
- [Amazon Cognito - Add authentication and authorization to your web apps](https://youtu.be/Su1w1uZg1z0)
- [Add Amazon Cognito to an existing application - NodeJS-Express and React](https://youtu.be/KRnZvbVT7uk)
- [Introduction to Amazon CloudFront - Add CDN to your applications](https://youtu.be/Z4frDpp4PcM)
- [Add AWS S3 storage and use a CDN in an existing application](https://youtu.be/gb1SfY7u118)
- [Testing serverless application locally - Demo with NodeJS, Express and React](https://youtu.be/U_7xD-o5mCA)
- [Building Amazon CloudWatch dashboards with AWS CDK](https://youtu.be/0VNKHIcQ5wk)

### AWS CDK useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
