import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as config from '../config.json';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Cpu } from '@aws-cdk/aws-apprunner-alpha';
import {
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';

interface AppRunnerStackProps extends StackProps {
	readonly stage: string;
	readonly userPoolId: string;
	readonly userPoolClientId: string;
}

export class AppRunnerStack extends Stack {
	public readonly url: CfnOutput;
	public readonly serviceName: CfnOutput;

	constructor(scope: Construct, id: string, props: AppRunnerStackProps) {
		super(scope, id, props);

		const mongoURISecret = Secret.fromSecretNameV2(this, 'secret', 'mongoURI');

		/*const policyDoc = new PolicyDocument({
			statements: [
				new PolicyStatement({
					resources: [],
					actions: [],
					effect: Effect.ALLOW,
				}),
			],
		});*/

		/*const instanceRole = new Role(
			this,
			`${props.stage}-instanceAppRunnerRole`,
			{
				description: 'Default role for app runner instances',
				assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
				inlinePolicies: {
					GiveReadAccess: policyDoc,
				},
			}
		);*/

		const appRunnerService = new apprunner.Service(
			this,
			`${props.stage}-AppRunnerService`,
			{
				source: apprunner.Source.fromGitHub({
					repositoryUrl: config.backend.repository_url,
					branch: 'main',
					configurationSource: apprunner.ConfigurationSourceType.API,
					codeConfigurationValues: {
						runtime: apprunner.Runtime.NODEJS_16,
						port: '8080',
						startCommand: 'npm run backend',
						buildCommand: 'npm i',
						environmentVariables: {
							USER_POOL_ID: props.userPoolId,
							USER_POOL_CLIENT_ID: props.userPoolClientId,
						},
						environmentSecrets: {
							mongoURI: apprunner.Secret.fromSecretsManager(mongoURISecret),
						},
					},
					connection: apprunner.GitHubConnection.fromConnectionArn(
						config.backend.apprunner_connectionARN
					),
					// NO AUTO DEPLOYMENTS IN ALPHA VERSION!
				}),

				//cpu: apprunner.Cpu.TWO_VCPU,
				//memory: apprunner.Memory.THREE_GB,
				//instanceRole: instanceRole,
			}
		);

		this.url = new CfnOutput(this, 'ServiceURL', {
			value: appRunnerService.serviceUrl,
		});

		this.serviceName = new CfnOutput(this, 'ServiceName', {
			value: appRunnerService.serviceName,
		});
	}
}
