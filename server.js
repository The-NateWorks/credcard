const http = require('http');
const fs = require('fs');
const path = require('path');

var users = JSON.parse(fs.readFileSync("users.json","utf8"));

var server = http.createServer((req, res) => {
    if (req.url == "/buy") {
        res.writeHead(200, {'Content-Type': 'text/html', 'charset':'utf-8' });
        res.write(fs.readFileSync(path.join(__dirname, "client.html"), 'utf8'));
        res.end();
    }
    res.on('data', (data) => {
        console.log(data);
    });
})
server.listen(3000, () => {
    console.log("listen to me")
});