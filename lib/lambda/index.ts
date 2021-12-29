import { SNSEvent } from 'aws-lambda';
import { AWSError } from "aws-sdk";
import { InvocationResponse, InvocationRequest } from "aws-sdk/clients/lambda";

const AWS = require('aws-sdk');

export async function handler(event: SNSEvent) {
    const records = event.Records.map(record => {
        const {Message, Subject, Type} = record.Sns;
        return {
            subject: Subject,
            message: Message,
            type: Type
        };
    });
    console.log('records: 👉', JSON.stringify(records, null, 2));

    try {
        console.log('----- !!! child lambda function invocation attempt !!! -----');
        const result = await invokeChildFunction({
            FunctionName: 'arn:aws:lambda:eu-west-1:368782345223:function:SnsLambdaExperimentStack-ChildLambdaCdkFunctionD12-uxxrMwQQyF9s',
            Payload: JSON.stringify(event, null, 2), // pass params
            InvocationType: "RequestResponse"
        })
        console.log('result of invocation 👉', result);
    } catch (e) {
        console.error('error: ',e);
    }

}

async function invokeChildFunction(params: InvocationRequest): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const lambda = new AWS.Lambda({
            region: 'eu-west-1' //change to your region
        });

        console.log('invoking another lambda...');

        lambda.invoke(params, function (error: AWSError, data: InvocationResponse) {
            console.log('child lambda function result 👉');
            if (error) {
                return reject(error);
            }
            if (data?.Payload) {
                return resolve(data.Payload.toString());
            }
            resolve("without payload finishing");
        });
    })
}
