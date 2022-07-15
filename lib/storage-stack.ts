import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { CachePolicy, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

interface StorageStackProps extends StackProps {
	readonly stage: string;
}

export class StorageStack extends Stack {
	public readonly bucketName: CfnOutput;
	public readonly bucketARN: CfnOutput;
	public readonly distributionDomainName: CfnOutput;

	constructor(scope: Construct, id: string, props: StorageStackProps) {
		super(scope, id, props);

		const bucketName = `${props.stage}-BackendFileUploadBucket`;

		const bucket = new Bucket(this, bucketName, {
			cors: [
				{
					allowedMethods: [
						HttpMethods.GET,
						HttpMethods.POST,
						HttpMethods.PUT,
						HttpMethods.DELETE,
					],
					allowedOrigins: ['*'],
					allowedHeaders: ['*'],
					exposedHeaders: [
						'x-amz-server-side-encryption',
						'x-amz-request-id',
						'x-amz-id-2',
						'ETag',
					],
					maxAge: 3000,
				},
			],
		});

		const distribution = new Distribution(
			this,
			`${props.stage}-BackendAppDistribution`,
			{
				defaultBehavior: {
					origin: new S3Origin(bucket),
				},
			}
		);

		this.bucketARN = new CfnOutput(this, 'BucketARN', {
			value: bucket.bucketArn,
		});

		this.bucketName = new CfnOutput(this, 'BucketName', {
			value: bucket.bucketName,
		});

		this.distributionDomainName = new CfnOutput(this, 'Distribution', {
			value: distribution.distributionDomainName,
		});
	}
}
