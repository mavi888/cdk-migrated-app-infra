#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendAppStack } from '../lib/backendapp-stack';
import * as config from '../config.json';
import { AmplifyStack } from '../lib/amplify-stack';
import { CognitoStack } from '../lib/cognito-stack';

const app = new cdk.App();

const cognito = new CognitoStack(app, `${config.stage}-CognitoStack`, {
	stage: config.stage,
});

const backendApp = new BackendAppStack(app, `${config.stage}-BackendAppStack`, {
	stage: config.stage,
	userPoolClientId: cognito.userPoolClientId.value,
	userPoolId: cognito.userPoolId.value,
});

const amplifyApp = new AmplifyStack(app, `${config.stage}-AmplifyStack`, {
	stage: config.stage,
	serverURL: backendApp.functionUrl.value,
	identityPoolId: cognito.identityPoolId.value,
	userPoolClientId: cognito.userPoolClientId.value,
	userPoolId: cognito.userPoolId.value,
});
