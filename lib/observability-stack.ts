import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Dashboard, GraphWidget, Metric } from 'aws-cdk-lib/aws-cloudwatch';

interface ObservabilityStackProps extends StackProps {
	readonly stage: string;
	readonly amplifyAppId: string;
	readonly serviceName: string;
	readonly serviceId: string;
	readonly serviceArn: string;
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

		//Widgets related to the Lambda function
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
	}
}
