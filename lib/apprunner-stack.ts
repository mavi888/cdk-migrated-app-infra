import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as config from '../config.json';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import {
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';

import { CfnService } from 'aws-cdk-lib/aws-apprunner';

interface AppRunnerStackProps extends StackProps {
	readonly stage: string;
	readonly userPoolId: string;
	readonly userPoolClientId: string;
	readonly dynamodbTableName: string;
	readonly dynamodbTableArn: string;
}

export class AppRunnerStack extends Stack {
	public readonly url: CfnOutput;
	public readonly serviceName: CfnOutput;
	public readonly serviceArn: CfnOutput;
	public readonly serviceId: CfnOutput;

	constructor(scope: Construct, id: string, props: AppRunnerStackProps) {
		super(scope, id, props);

		const mongoURISecret = Secret.fromSecretNameV2(this, 'secret', 'mongoURI');

		const giveReadAccessToSecretPolicy = new PolicyDocument({
			statements: [
				new PolicyStatement({
					resources: [config.backend['mongouri-secret-arn']],
					actions: ['secretsmanager:GetSecretValue'],
					effect: Effect.ALLOW,
				}),
			],
		});

		const giveCRUDAccessToDynamoTable = new PolicyDocument({
			statements: [
				new PolicyStatement({
					resources: [
						props.dynamodbTableArn,
						`${props.dynamodbTableArn}/index/*`,
					],
					actions: [
						'dynamodb:BatchGetItem',
						'dynamodb:BatchWriteItem',
						'dynamodb:ConditionCheckItem',
						'dynamodb:PutItem',
						'dynamodb:DescribeTable',
						'dynamodb:DeleteItem',
						'dynamodb:GetItem',
						'dynamodb:Scan',
						'dynamodb:Query',
						'dynamodb:UpdateItem',
					],
					effect: Effect.ALLOW,
				}),
			],
		});

		const instanceRole = new Role(
			this,
			`${props.stage}-instanceAppRunnerRole`,
			{
				description: 'Default role for app runner instances',
				assumedBy: new ServicePrincipal('tasks.apprunner.amazonaws.com'),
				inlinePolicies: {
					GiveReadAccessToSecret: giveReadAccessToSecretPolicy,
					GiveCRUDAccessToTable: giveCRUDAccessToDynamoTable,
				},
			}
		);

		const appRunnerService1 = new CfnService(
			this,
			`${props.stage}-AppRunnerService1`,
			{
				serviceName: `${props.stage}-AppRunnerService`,
				sourceConfiguration: {
					authenticationConfiguration: {
						connectionArn: config.backend.apprunner_connectionARN,
					},
					autoDeploymentsEnabled: true,
					codeRepository: {
						codeConfiguration: {
							codeConfigurationValues: {
								startCommand: 'npm run prod',
								buildCommand: 'npm i && npm run build',
								port: '8080',
								runtime: 'NODEJS_16',
								runtimeEnvironmentVariables: [
									{
										name: 'USER_POOL_ID',
										value: props.userPoolId,
									},
									{
										name: 'USER_POOL_CLIENT_ID',
										value: props.userPoolClientId,
									},
									{
										name: 'TABLE_NAME',
										value: props.dynamodbTableName,
									},
								],
							},
							configurationSource: 'API',
						},
						repositoryUrl: config.backend.repository_url,
						sourceCodeVersion: {
							type: 'BRANCH',
							value: config.backend.branch,
						},
					},
				},
				instanceConfiguration: {
					instanceRoleArn: instanceRole.roleArn,
				},
			}
		);

		this.url = new CfnOutput(this, 'ServiceURL', {
			value: appRunnerService1.attrServiceUrl,
		});

		this.serviceName = new CfnOutput(this, 'ServiceName', {
			value: `${props.stage}-AppRunnerService1`,
		});

		this.serviceArn = new CfnOutput(this, 'ServiceArn', {
			value: appRunnerService1.attrServiceArn,
		});

		this.serviceId = new CfnOutput(this, 'serviceId', {
			value: appRunnerService1.attrServiceId,
		});
	}
}
