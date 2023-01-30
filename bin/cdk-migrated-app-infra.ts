#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as config from '../config.json';
import { AmplifyStack } from '../lib/amplify-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { StorageStack } from '../lib/storage-stack';
import { ObservabilityStack } from '../lib/observability-stack';
import { AppRunnerStack } from '../lib/apprunner-stack';

const app = new cdk.App();

const storage = new StorageStack(app, `${config.stage}-BackendStorageStack`, {
	stage: config.stage,
});

const cognito = new CognitoStack(app, `${config.stage}-CognitoStack`, {
	stage: config.stage,
	storageBucketARN: storage.bucketARN.value,
});

const appRunner = new AppRunnerStack(app, `${config.stage}-AppRunnerStack`, {
	stage: config.stage,
	userPoolClientId: cognito.userPoolClientId.value,
	userPoolId: cognito.userPoolId.value,
});

const amplifyApp = new AmplifyStack(app, `${config.stage}-AmplifyStack`, {
	stage: config.stage,
	serverURL: `https://${appRunner.url.value}/`,
	identityPoolId: cognito.identityPoolId.value,
	userPoolClientId: cognito.userPoolClientId.value,
	userPoolId: cognito.userPoolId.value,
	bucketName: storage.bucketName.value,
	distributionDomainName: storage.distributionDomainName.value,
});

const observability = new ObservabilityStack(
	app,
	`${config.stage}-MERNObservabilityStack`,
	{
		stage: config.stage,
		amplifyAppId: amplifyApp.amplifyAppId.value,
		functionName: appRunner.serviceName.value,
	}
);
