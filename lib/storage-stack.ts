import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';

interface StorageStackProps extends StackProps {
	readonly stage: string;
}

export class StorageStack extends Stack {
	public readonly bucketName: CfnOutput;
	public readonly bucketARN: CfnOutput;

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

		this.bucketARN = new CfnOutput(this, 'BucketARN', {
			value: bucket.bucketArn,
		});

		this.bucketName = new CfnOutput(this, 'BucketName', {
			value: bucket.bucketName,
		});
	}
}
