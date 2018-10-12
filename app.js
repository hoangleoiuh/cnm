var http = require('http');
var url = require('url');
var fs = require('fs');
var aws = require('aws-sdk');

//cau hinh aws
aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});
aws.config.accessKeyId="hoang";
aws.config.secretAccessKey="ktpm";
var dynamodb = new aws.DynamoDB();
var docClient = new aws.DynamoDB.DocumentClient();
var tableName = "Movie_fn";

//server
var server = http.createServer(function (req, res) {
    var pathname = url.parse(req.url, true).pathname;
    var qdt = url.parse(req.url, true).query;

    console.log(pathname);
    switch (pathname) {
        case '/':{

            fs.readFile('trangchu.html', function (err, data) {
                if (err)
                    console.log("Err", JSON.stringify(err, null, 2));
                else
                    res.end(data);
            });
            break;
        }
        case '/ftimkiem':{
            fs.readFile('timkiem.html', function (err, data) {
                if (err)
                    console.log("Err", JSON.stringify(err, null, 2));
                else
                    res.end(data);
            });
            break;
        }
        case '/timkiem':{
            let nam = qdt.nam;
            console.log(nam);
            timkiem(nam, res);
            break;
        }
        case '/fthem':{
            fs.readFile('them.html', function (err, data) {
                if (err)
                    console.log("Err", JSON.stringify(err, null, 2));
                else
                    res.end(data);
            });
            break;
        }
        case '/them':{
            let nam = qdt.nam;
            let tieude = qdt.tieude;
            let mota = qdt.mota;
            them(nam, tieude, mota, res);
            break;
        }
        case '/fdanhsach':{
            danhsach(res);
            break;
        }
        case '/xoa':{
            let nam = qdt['yr'];
            let tieude = qdt['tt'];
            console.log(nam + tieude);
            xoa(nam, tieude, res);
            break;
        }
        case '/fsua':{
            let nam = qdt['yr'];
            let tieude= qdt['tt'];
            let motaold = qdt['mt'];
            console.log(nam+tieude+motaold);
            res.writeHead(200, {"Content-Type":"text/html"});
            res.write("<form action='/sua' method='get'>")
            res.write("Nam <input type='text' name='nam' value='"+nam+"' readonly='trưe' /> <br/>");
            res.write("Tieu de <input type='text' name='tieude' value='"+tieude+"' readonly='trưe' /> <br/>");
            res.write("Mo ta <input type='text' name='mota' value='"+motaold+"' /> <br/>");
            res.write("<input type='submit' value='Sua' /> <br/>");
            res.write("</form>");
            res.end();
            break;
        }
        case '/sua':{
            let nam = qdt.nam;
            let tieude= qdt.tieude;
            let motanew = qdt.mota;
            console.log(nam+tieude+motanew);
            sua(nam, tieude, motanew, res);
            break;
        }
        default:{
            fs.readFile('loi.html', function (err, data) {
                if (err)
                    console.log("Err");
                else
                    res.end(data);
            })
        }
    };

}).listen(8080, function () {
    console.log("Listenning port 8080...");
});

//function
function timkiem(nam, res) {
    let params = {
        TableName : tableName,
        ProjectionExpression: "#yr, title, info",
        FilterExpression:"#yr = :nam",
        ExpressionAttributeNames:{
            "#yr" : "year"
        },
        ExpressionAttributeValues:{
            ":nam" : Number(nam)
        }
    };
    docClient.scan(params, onScan);
    function onScan(err, data) {
        if (err)
            console.log("Err");
        else
        {
            res.writeHead(200, {"Content-Type":"text/html"});
            data.Items.forEach(function (m) {
                res.write("- " + m.year + " - "+ m.title + "<br/>");
            });
            res.write("<a href='/'>Trang chu</a>  <br/>");
            res.end();
        }
    }
};
function them(nam, tieude, mota, res) {
    var params = {
        TableName: tableName,
        Item:{
            "year":Number(nam),
            "title":tieude,
            "info":{
                "rating" : mota
            }
        }
    };
    docClient.put(params, function (err, data) {
        res.writeHead(200, {"Content-type":"text/html"});
        if (err){
            res.write("Them that bai!<br/> <a href='/'>Trang chu</a>");
        }
        else
        {
            res.write("Them thanh cong!<br/> <a href='/'>Trang chu</a>");
        }
        res.end();
    })
};
function danhsach(res) {
    var params = {
        TableName:tableName,
    };
    docClient.scan(params, function (err, data) {
        res.writeHead(200, {"Content-type":"text/html"});
        if (err){
            res.write("Khong thanh cong!<br/> <a href='/'>Trang chu</a>");
        }
        else
        {
            data.Items.forEach(function (m) {
                res.write("- " + m.year + " - " + m.title + " - " + m.info.rating + " <a href='/xoa?yr="+m.year+"&tt="+m.title+"'>Xoa</a> - <a href='/fsua?yr="+m.year+"&tt="+m.title+"&mt="+m.info.rating+"'>Sua</a> <br/>");
            });
        }
        res.write("<a href='/'>Trang chu</a>");
        res.end();
    })
};
function xoa(nam, tieude, res) {
    var params = {
        TableName:tableName,
        Key:{
            "year":Number(nam),
            "title": tieude
        }
    };
    docClient.delete(params, function (err, data) {
        res.writeHead(200, {"Content-type":"text/html"});
        if (err){
            res.write("Xoa khong thanh cong!<br/> <a href='/'>Trang chu</a>");
        }
        else
        {
           res.write("Xoa thanh cong!<br/>");
        }
        res.write("<a href='/'>Trang chu</a>");
        res.end();
    })
};
function sua(nam, tieude, mota, res) {
    var params = {
        TableName : tableName,
        Key:{
            "year" : Number(nam),
            "title" : tieude
        },
        UpdateExpression:"set info.rating= :n",
        ExpressionAttributeValues: {
            ":n" : mota
        },
        ReturnValue : "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {
        res.writeHead(200, {"Content-type":"text/html"});
        if (err){
            res.write("Sua khong thanh cong!<br/> <a href='/'>Trang chu</a>");
        }
        else
        {
            res.write("Sua thanh cong!<br/>");
        }
        res.write("<a href='/'>Trang chu</a>");
        res.end();

    })
};
