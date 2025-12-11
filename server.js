const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
var users = JSON.parse(fs.readFileSync(path.join(__dirname,"users.json"), "utf8"));
function writeBack() {
    fs.writeFileSync(path.join(__dirname,"users.json"), JSON.stringify(users));
    users = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf8"));
}
function buy(price, user) {
    if (users[user].spent + price <= users[user].max) {
        users[user].spent += price;
        users[user].debt += price;
        writeBack();
    }
}
function upsies(init, rate, time) {
    var price = init;
    for (let i = 0; i < time; i++) {
        price = (price*rate)+price;
    }
    return price;
}
console.log(upsies(100, .20, 1));
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
    const username = req.body.username;
    const password = req.body.password;
    console.log(req.body)
    if (req.body.sign == '') {
        console.log("signin");
        if (users[username]) {
            if (users[username].password == password) {
                res.redirect(`/dash?username=${username}&password=${password}`);
            }
        }
    } else if (req.body.reg == '') {
        console.log("register");
        if (username != "" && password != "") {
            var debt = 0;
            var max = 0;
            switch(req.body.level) {
                case 'normal':
                    debt = 0;
                    max = 10000;
                    break;
                case 'pro':
                    debt = 100;
                    max = 30000;
                    break;
                case 'premium':
                    debt = 400;
                    max = 50000;
                    break;
                case 'deluxe':
                    debt = 1000;
                    max = 100000;
                case 'nate\'s approval':
                    debt = 1000000;
                    max = 1000000000;
                    break;
            }
            users[username] = {
                "debt":debt,
                "max":max,
                "spent":0,
                "investments":{},
                "password":password
            }
            writeBack();
            res.redirect(`/dash?username=${username}&password=${password}`)
        }
    }
    res.sendFile(path.join(__dirname, "main.html"));
})
app.get("/dash", (req,res) => {
    res.sendFile(path.join(__dirname, "dash.html"));
});
app.post("/dash", (req,res) => {
    console.log(req.body);
    if (req.body.username && req.body.password) {
        var username = req.body.username;
        var password = req.body.password;
        if (users[username] && password == users[username].password) {
            console.log("User "+username+" has logged in to a request node");
            if (req.body.invest_amount != undefined && req.body.invest_name != undefined) {
                var amount = parseInt(req.body.invest_amount);
                users[username].investments[req.body.invest_name] = {init_amount:amount, init_start:new Date()};
                buy(amount, username);
                res.redirect("./");
            } else if (req.body.invest_check != undefined) {
                var name = req.body.invest_check;
                console.log(users[username].investments);
                if (users[username].investments[name]) {
                    var daysalive = (new Date() - new Date(users[username]["investments"][name].init_start)) / (1000 * 60 * 60 *24);
                    var message = `The investment ${name} is at $${upsies(users[username].investments[name].init_amount,.20, Math.round(daysalive))} and has been around for ${Math.round(daysalive)} days`;
                    res.redirect("./message?message="+message);
                } else {
                    res.redirect("./message?message=That Investment Does Not exist");
                }
            } else if (req.body.sell_name != undefined) {
                var name = req.body.sell_name;
                if (users[username].investments[name]) {
                    var daysalive = (new Date() - new Date(users[username]["investments"][name].init_start)) / (1000 * 60 * 60 *24);
                    users[username].debt -= (upsies(users[username].investments[name].init_amount,.20, Math.round(daysalive)));
                    delete users[username].investments[name];
                    writeBack();
                    res.redirect("./");
                } else {
                    res.redirect("./message?message=That Investment Does Not exist");
                }
            } else if (req.body.check_account != undefined) {
                var account = users[username];
                var dept = account.debt;
                var max = account.max;
                var spent = account.spent;
                var pw = account.password;
                var mess = `Account of ${username}:<br>Dept: $${dept}<br>Spendings: $${spent}/$${max}<br>Password: ${pw}`;
                res.redirect("./message?message="+mess);
            }
        } else {
            res.redirect("./message?message=Incorrect Username or Password");
        }
    }
})
app.get("/invest_clear", (req,res) => {
    users["4D69636861656C"].investments = {};
    writeBack();
    console.log("cleared investments");
    res.redirect("./");
});
app.get("/message", (req, res) => {
    res.sendFile(path.join(__dirname, "message.html"));
})
app.get("/users6741", (req, res) => {
    res.send(fs.readFileSync(path.join(__dirname, "users.json"), "utf8"));
})
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});