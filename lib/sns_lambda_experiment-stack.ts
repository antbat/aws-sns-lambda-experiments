import {
    Stack, StackProps,
    aws_s3 as s3,
    aws_sns as sns,
    aws_lambda as lambda,
    aws_iam as iam, Duration
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

export class SnsLambdaExperimentStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'MyFirstCdkMadeBucket', {
            versioned: true
        });
        const topic = new sns.Topic(this, 'LambdaTriggerTopic', {
            displayName: 'Customer subscription topic',
        });
        const snsAccessPolicy = new iam.PolicyStatement({
            resources: [topic.topicArn],
            principals: [new iam.AccountPrincipal(123)],
            actions: ["SNS:Subscribe"],
            effect: iam.Effect.ALLOW
        })
        topic.addToResourcePolicy(snsAccessPolicy);

        const fn = new lambda.Function(this, 'MyFirstLambdaCdkFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
            timeout: Duration.seconds(10) // sec
        });
        // const crossAccountTopic = sns.Topic.fromTopicArn(this, "topic-id", "arn:aws:sns:<region>:<accountId>:topicName")
        topic.addSubscription(new LambdaSubscription(fn));

        // create second child lambda
        const child = new lambda.Function(this, 'ChildLambdaCdkFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.childHandler',
            code: lambda.Code.fromAsset(path.join(__dirname, './lambda_child')),
        });
        fn.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions:[
                "lambda:InvokeFunction",
                "lambda:InvokeAsync"
            ],
            resources: ["*"]
        }))
        // create policy
        // create invoke role
    }
}
