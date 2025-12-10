const fs = require('fs');
const path = require('path');
const http = require('http');
var server = http.createServer(function (req, res) {
    if (req.url === '/buy') {
        res.writeHead(200, {'Content-Type': 'text/html', 'charset':'utf-8' });
        res.write(fs.readFileSync(path.join(__dirname, "client.html"), 'utf8'));
        res.end();
    }
    
    req.on('data', (d) => {
        console.log('Received data:', d.toString());
    });
});
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});