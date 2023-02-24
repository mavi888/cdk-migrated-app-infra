import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	AttributeType,
	GlobalSecondaryIndexProps,
	Table,
} from 'aws-cdk-lib/aws-dynamodb';

interface DynamoDBStackProps extends StackProps {
	readonly stage: string;
}

export class DynamoDBStack extends Stack {
	public readonly tableName: CfnOutput;
	public readonly tableArn: CfnOutput;

	constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
		super(scope, id, props);

		const table = new Table(this, `${props.stage}-tableDynamoDB`, {
			partitionKey: {
				name: 'PK',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'SK',
				type: AttributeType.STRING,
			},
		});

		const gsi1: GlobalSecondaryIndexProps = {
			indexName: 'GSI1',
			partitionKey: {
				name: 'GSI1PK',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'GSI1SK',
				type: AttributeType.STRING,
			},
		};

		table.addGlobalSecondaryIndex(gsi1);

		const gsi2: GlobalSecondaryIndexProps = {
			indexName: 'GSI2',
			partitionKey: {
				name: 'GSI2PK',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'GSI2SK',
				type: AttributeType.NUMBER,
			},
		};

		table.addGlobalSecondaryIndex(gsi2);

		const gsi3: GlobalSecondaryIndexProps = {
			indexName: 'GSI3',
			partitionKey: {
				name: 'GSI3PK',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'GSI3SK',
				type: AttributeType.STRING,
			},
		};

		table.addGlobalSecondaryIndex(gsi3);

		this.tableName = new CfnOutput(this, 'DynamoDBTableName', {
			value: table.tableName,
		});

		this.tableArn = new CfnOutput(this, 'DynamoDBTableArn', {
			value: table.tableArn,
		});
	}
}
