import { Event } from "aws-cdk-lib/aws-stepfunctions-tasks";

export async function childHandler(event: Event) {
    console.log('child lambda was invoked with event 👉', JSON.stringify(event, null, 4));
    return {
        msg: "data from child function",
        isComplete: true
    }
}
