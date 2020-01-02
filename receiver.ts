import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import 'source-map-support/register';


const dynamo = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
AWS.config.logger = console;

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  console.log(event.body);
  const json:BackendModel = {
    ...JSON.parse(event.body),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const item = {
    TableName: "DynamoDBStageTable",
    ReturnConsumedCapacity: "TOTAL",
    Item: json
  };

  try {
    await dynamo.put(item).promise();
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error DynamoDB"
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message:
          "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!"
      },
      null,
      2
    )
  };
};
