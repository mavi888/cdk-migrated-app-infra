import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	UserPool,
	UserPoolClient,
	CfnIdentityPool,
	CfnIdentityPoolRoleAttachment,
} from 'aws-cdk-lib/aws-cognito';
import {
	Role,
	FederatedPrincipal,
	ManagedPolicy,
	PolicyDocument,
	PolicyStatement,
	Effect,
} from 'aws-cdk-lib/aws-iam';

interface CognitoStackProps extends StackProps {
	readonly stage: string;
	readonly storageBucketARN: string;
}

export class CognitoStack extends Stack {
	public readonly userPoolId: CfnOutput;
	public readonly userPoolClientId: CfnOutput;
	public readonly identityPoolId: CfnOutput;

	constructor(scope: Construct, id: string, props: CognitoStackProps) {
		super(scope, id, props);

		const userPool = new UserPool(this, `${props.stage}-UserPoolReactShopApp`, {
			selfSignUpEnabled: true, // Allow users to sign up
			autoVerify: { email: true }, // Verify email addresses by sending a verification code
			signInAliases: { email: true }, // Set email as an alias
		});

		const userPoolClient = new UserPoolClient(
			this,
			`${props.stage}-UserPoolClientReactShopApp`,
			{
				userPool,
				generateSecret: false, // Don't need to generate secret for web app running on browsers
			}
		);

		const identityPool = new CfnIdentityPool(
			this,
			`${props.stage}-IdentityPoolReactShopApp`,
			{
				allowUnauthenticatedIdentities: true,
				cognitoIdentityProviders: [
					{
						clientId: userPoolClient.userPoolClientId,
						providerName: userPool.userPoolProviderName,
					},
				],
			}
		);

		const giveReadAccessS3 = new PolicyDocument({
			statements: [
				new PolicyStatement({
					resources: [
						props.storageBucketARN,
						`${props.storageBucketARN}/public/*`,
					],
					actions: ['s3:GetObject'],
					effect: Effect.ALLOW,
				}),
			],
		});

		const giveReadWriteAccessS3 = new PolicyDocument({
			statements: [
				new PolicyStatement({
					resources: [
						props.storageBucketARN,
						`${props.storageBucketARN}/public/*`,
					],
					actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
					effect: Effect.ALLOW,
				}),
			],
		});

		const isAnonymousCognitoGroupRole = new Role(
			this,
			`${props.stage}-AnonymousGroupRoleReactShopApp`,
			{
				description: 'Default role for anonymous users',
				assumedBy: new FederatedPrincipal(
					'cognito-identity.amazonaws.com',
					{
						StringEquals: {
							'cognito-identity.amazonaws.com:aud': identityPool.ref,
						},
						'ForAnyValue:StringLike': {
							'cognito-identity.amazonaws.com:amr': 'unauthenticated',
						},
					},
					'sts:AssumeRoleWithWebIdentity'
				),
				inlinePolicies: {
					GiveReadAccess: giveReadAccessS3,
				},
			}
		);

		const isUserCognitoGroupRole = new Role(
			this,
			`${props.stage}-UserGroupRoleReactShopApp`,
			{
				description: 'Default role for authenticated users',
				assumedBy: new FederatedPrincipal(
					'cognito-identity.amazonaws.com',
					{
						StringEquals: {
							'cognito-identity.amazonaws.com:aud': identityPool.ref,
						},
						'ForAnyValue:StringLike': {
							'cognito-identity.amazonaws.com:amr': 'authenticated',
						},
					},
					'sts:AssumeRoleWithWebIdentity'
				),
				inlinePolicies: {
					GiveReadWriteAccessS3: giveReadWriteAccessS3,
				},
			}
		);

		new CfnIdentityPoolRoleAttachment(
			this,
			`${props.stage}-IdentityPoolRoleAttachmentReactShopApp`,
			{
				identityPoolId: identityPool.ref,
				roles: {
					authenticated: isUserCognitoGroupRole.roleArn,
					unauthenticated: isAnonymousCognitoGroupRole.roleArn,
				},
				roleMappings: {
					mapping: {
						type: 'Token',
						ambiguousRoleResolution: 'AuthenticatedRole',
						identityProvider: `cognito-idp.${
							Stack.of(this).region
						}.amazonaws.com/${userPool.userPoolId}:${
							userPoolClient.userPoolClientId
						}`,
					},
				},
			}
		);

		this.userPoolId = new CfnOutput(this, 'UserPoolReactShopApp', {
			value: userPool.userPoolId,
		});
		this.userPoolClientId = new CfnOutput(this, 'UserPoolClientReactShopApp', {
			value: userPoolClient.userPoolClientId,
		});
		this.identityPoolId = new CfnOutput(this, 'IdentityPoolReactShopApp', {
			value: identityPool.ref,
		});
	}
}
