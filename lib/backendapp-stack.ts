import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	Function,
	Runtime,
	Code,
	LayerVersion,
	FunctionUrlAuthType,
	HttpMethod,
	Tracing,
} from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Effect, Policy } from 'aws-cdk-lib/aws-iam';
import * as config from '../config.json';

interface BackendAppStackProps extends StackProps {
	readonly stage: string;
	readonly userPoolId: string;
	readonly userPoolClientId: string;
}

export class BackendAppStack extends Stack {
	public readonly functionUrl: CfnOutput;
	public readonly functionName: CfnOutput;

	constructor(scope: Construct, id: string, props: BackendAppStackProps) {
		super(scope, id, props);

		// Lambda Adapter Layer
		const layerLambdaAdapter = LayerVersion.fromLayerVersionArn(
			this,
			'LambdaAdapterLayerX86',
			`arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:3`
		);

		// Lambda
		const lambdaAdapterFunction = new Function(
			this,
			`${props.stage}-LambdaAdapterFunction`,
			{
				runtime: Runtime.NODEJS_16_X,
				code: Code.fromAsset('backend-app'),
				handler: 'run.sh',
				environment: {
					AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
					RUST_LOG: 'info',
					REGION: this.region,
					USER_POOL_ID: props.userPoolId,
					USER_POOL_CLIENT_ID: props.userPoolClientId,
				},
				memorySize: 2048,
				layers: [layerLambdaAdapter],
				timeout: Duration.minutes(2),
				tracing: Tracing.ACTIVE,
			}
		);

		const giveReadAccessToSecretPolicy = new PolicyStatement({
			resources: [config.backend['mongouri-secret-arn']],
			actions: ['secretsmanager:GetSecretValue'],
			effect: Effect.ALLOW,
		});

		lambdaAdapterFunction.role?.attachInlinePolicy(
			new Policy(this, `${props.stage}-GiveReadAccessToSecretPolicy`, {
				statements: [giveReadAccessToSecretPolicy],
			})
		);

		const lambdaAdapterFunctionUrl = lambdaAdapterFunction.addFunctionUrl({
			authType: FunctionUrlAuthType.NONE,
			cors: {
				allowedOrigins: ['*'],
				allowedMethods: [HttpMethod.ALL],
				allowedHeaders: ['*'],
			},
		});

		this.functionUrl = new CfnOutput(this, 'FunctionUrl', {
			value: lambdaAdapterFunctionUrl.url,
		});

		this.functionName = new CfnOutput(this, 'FunctionName', {
			value: lambdaAdapterFunction.functionName,
		});
	}
}
