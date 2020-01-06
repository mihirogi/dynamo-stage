import { Table, Decorator, Query } from "dynamo-types";
import * as AWS from "aws-sdk";
import { TableHandler, StreamHandler } from "dynamo-types-stream";
import "source-map-support/register";

AWS.config.logger = console;
const sns = new AWS.SNS();

@Decorator.Table({ name: `${process.env.stage}DynamoDBStageTable` })
class BackendModelRecord extends Table implements BackendModel {
  @Decorator.HashPrimaryKey("id")
  public static readonly primaryKey: Query.HashPrimaryKey<
    BackendModelRecord,
    string
  >;

  @Decorator.Attribute()
  public id: string;

  @Decorator.Attribute()
  public createdAt: number;

  @Decorator.Attribute()
  public updatedAt: number;
}

const streamHandler = new StreamHandler([
  new TableHandler(
    BackendModelRecord,
    "Series",
    [
      {
        eventType: "INSERT",
        name: "Insert Records",
        async handler(events) {
          for (const event of events) {
            try {
              const message = `
              id: ${event.newRecord.id}
              createdAt: ${event.newRecord.createdAt}
              updatedAt: ${event.newRecord.updatedAt}
              `;
              await sns
                .publish({
                  Subject: `Private-${process.env.stage}環境`,
                  Message: message,
                  TopicArn: process.env.topicArn
                })
                .promise();
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    ],
    async (handlerDef, events, error) => {
      console.log(handlerDef.name, events, error);
    }
  )
]);

export const handler = streamHandler.lambdaHandler;
