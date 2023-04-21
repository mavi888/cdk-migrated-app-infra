import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Dashboard, GraphWidget, Metric } from 'aws-cdk-lib/aws-cloudwatch';

interface ObservabilityStackProps extends StackProps {
	readonly stage: string;
	readonly amplifyAppId: string;
	readonly serviceName: string;
	readonly serviceId: string;
	readonly serviceArn: string;
	readonly dynamoDBTableName: string;
}

export class ObservabilityStack extends Stack {
	constructor(scope: Construct, id: string, props: ObservabilityStackProps) {
		super(scope, id, props);

		const dashboard = new Dashboard(
			this,
			`${props.stage}-MigrateApp-Dashboard`,
			{
				dashboardName: 'Migrated-MERN-app-to-Serverless-Dashboard',
			}
		);

		//Widgets related to the Amplify app
		dashboard.addWidgets(
			new GraphWidget({
				title: 'AWS Amplify Requests (sum)',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/AmplifyHosting',
						metricName: 'Requests',
						dimensionsMap: {
							App: props.amplifyAppId,
						},
						statistic: 'sum',
						label: 'Sum',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'AWS Amplify 4xx/5xx errors (sum)',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/AmplifyHosting',
						metricName: '4xxErrors',
						dimensionsMap: {
							App: props.amplifyAppId,
						},
						statistic: 'sum',
						label: 'Sum 4xx Errors',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/AmplifyHosting',
						metricName: '5xxErrors',
						dimensionsMap: {
							App: props.amplifyAppId,
						},
						statistic: 'sum',
						label: 'Sum 5xx Erros',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'AWS Amplify Latency (p99)',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/AmplifyHosting',
						metricName: 'Latency',
						dimensionsMap: {
							App: props.amplifyAppId,
						},
						statistic: 'p99',
						label: 'P99',
						period: Duration.minutes(1),
					}),
				],
			})
		);

		//Widgets related to the AppRunner service
		dashboard.addWidgets(
			new GraphWidget({
				title: 'AppRunner Requests and Responses',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/AppRunner',
						metricName: 'Requests',
						dimensionsMap: {
							ServiceName: props.serviceName,
							ServiceID: props.serviceId,
						},
						statistic: 'sum',
						label: 'Request',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/AppRunner',
						metricName: '2xxStatusResponses',
						dimensionsMap: {
							ServiceName: props.serviceName,
							ServiceID: props.serviceId,
						},
						statistic: 'sum',
						label: '2xxStatusResponses',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/AppRunner',
						metricName: '4xxStatusResponses',
						dimensionsMap: {
							ServiceName: props.serviceName,
							ServiceID: props.serviceId,
						},
						statistic: 'sum',
						label: '4xxStatusResponses',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/AppRunner',
						metricName: '5xxStatusResponses',
						dimensionsMap: {
							ServiceName: props.serviceName,
							ServiceID: props.serviceId,
						},
						statistic: 'sum',
						label: '5xxStatusResponses',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'AppRunner active Instances',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/AppRunner',
						metricName: 'ActiveInstances',
						dimensionsMap: {
							ServiceName: props.serviceName,
							ServiceID: props.serviceId,
						},
						statistic: 'sum',
						label: 'Sum Active instances',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'AppRunner Request Latency (p99)',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/AppRunner',
						metricName: 'RequestLatency',
						dimensionsMap: {
							ServiceName: props.serviceName,
							ServiceID: props.serviceId,
						},
						statistic: 'p99',
						label: 'p99 Latency',
						period: Duration.minutes(1),
					}),
				],
			})
		);

		//Widgets related to the DynamoDB table
		dashboard.addWidgets(
			new GraphWidget({
				title: 'Capacity for table',
				width: 12,
				right: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
						},
						statistic: 'Maximum',
						label: 'Maximum ProvisionedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
						},
						statistic: 'Maximum',
						label: 'Maximum ConsumedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
				left: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
						},
						statistic: 'Maximum',
						label: 'Maximum ProvisionedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
						},
						statistic: 'Maximum',
						label: 'Maximum ConsumedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'Capacity For Index GSI1',
				width: 12,
				right: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI1',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI1 ProvisionedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI1',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI1 ConsumedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
				left: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI1',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI1 ProvisionedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI1',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI1 ConsumedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'Capacity For Index GSI2',
				width: 12,
				right: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI2',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI2 ProvisionedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI2',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI2 ConsumedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
				left: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI2',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI2 ProvisionedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI2',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI2 ConsumedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'Capacity For Index GSI3',
				width: 12,
				right: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI3',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI3 ProvisionedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedWriteCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI3',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI3 ConsumedWriteCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
				left: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ProvisionedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI3',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI3 ProvisionedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ConsumedReadCapacityUnits',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI3',
						},
						statistic: 'Maximum',
						label: 'Maximum GSI3 ConsumedReadCapacityUnits',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'Latency for table operations',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'SuccessfulRequestLatency',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							Operation: 'GetItem',
						},
						statistic: 'p99',
						label: 'p99 GetItem SuccessfulRequestLatency',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'SuccessfulRequestLatency',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							Operation: 'Query',
						},
						statistic: 'p99',
						label: 'p99 Query SuccessfulRequestLatency',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'SuccessfulRequestLatency',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							Operation: 'UpdateItem',
						},
						statistic: 'p99',
						label: 'p99 UpdateItem SuccessfulRequestLatency',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'SuccessfulRequestLatency',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							Operation: 'PutItem',
						},
						statistic: 'p99',
						label: 'p99 PutItem SuccessfulRequestLatency',
						period: Duration.minutes(1),
					}),
				],
			}),
			new GraphWidget({
				title: 'Read throttles for Indexes',
				width: 12,
				left: [
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ReadThrottleEvents',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI1',
						},
						statistic: 'Maximum',
						label: 'Sum GSI1 ReadThrottleEvents',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ReadThrottleEvents',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI2',
						},
						statistic: 'sum',
						label: 'Sum GSI2 ReadThrottleEvents',
						period: Duration.minutes(1),
					}),
					new Metric({
						namespace: 'AWS/DynamoDB',
						metricName: 'ReadThrottleEvents',
						dimensionsMap: {
							TableName: props.dynamoDBTableName,
							GlobalSecondaryIndexName: 'GSI3',
						},
						statistic: 'sum',
						label: 'Sum GSI3 ReadThrottleEvents',
						period: Duration.minutes(1),
					}),
				],
			})
		);
	}
}
