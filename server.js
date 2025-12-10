const http = require('http');
const fs = require('fs');

var users = JSON.parse(fs.readFileSync("users.json","utf8"));

var server = http.createServer((req, res) => {
    if (req.url == "/buy") {
        res.setHeader("Content-Type", "text/html");
        res.end(fs.readFileSync("client.html", "utf8"));
    }
    res.on('data', (data) => {
        console.log(data);
    });
})
server.listen(3000, "localhost");