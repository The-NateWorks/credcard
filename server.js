const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
var users = JSON.parse(fs.readFileSync(path.join(__dirname,"users.json"), "utf8"));
function writeBack() {
    fs.writeFileSync(path.join(__dirname,"users.json"), JSON.stringify(users));
}
app.use(express.urlencoded({ extended: true }));
// For parsing application/json (if your form also sends JSON)
app.use(express.json());
app.get('/console', (req, res) => {
    res.sendFile(path.join(__dirname, 'client.html'));
});
app.post("/console", (req, res) => {
    console.log(req.body.user)
    let price = req.body.price;
    let user = req.body.user;
    if (users[user]) {
        if (users[user].spent + parseInt(price) <= users[user].max) {
            users[user].spent += parseInt(price);
            users[user].debt += parseInt(price);
            writeBack();
            res.sendFile(path.join(__dirname, "client.html"))
        } else {
            res.send("Max Credits Reeached");
        }
    } else {
        res.send("No User Detected");
    }
    
});
app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "main.html"));
})
app.post("/", (req, res) => {
    if (req.body.sign) {
        console.log("signin");
    } else if (req.body.reg) {
        console.log("register");
    }
    res.sendFile(path.join(__dirname, "main.html"));
})
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});