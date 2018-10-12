var aws = require('aws-sdk');

//cau hinh aws
aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});
aws.config.accessKeyId="hoang";
aws.config.secretAccessKey="ktpm";
var dynamodb = new aws.DynamoDB();
var tableName = "Movie_fn";

var params={
    TableName:tableName,
    KeySchema:[
        {AttributeName:"year", KeyType:"HASH"},
        {AttributeName:"title", KeyType:"RANGE"}
    ],
    AttributeDefinitions:[
        {AttributeName:"year", AttributeType:"N"},
        {AttributeName:"title", AttributeType:"S"}
    ],
    ProvisionedThroughput:{
        ReadCapacityUnits:10,
        WriteCapacityUnits:10
    }
};


dynamodb.createTable(params, function (err, data) {
    if (err)
        console.log("Err", JSON.stringify(err, null, 2));
    else
    {
        console.log("Done");
    }
})