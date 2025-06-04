const express = require("express");
const db = require("./database");
const app = express();
const path = require('path');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const {v4: uuidv4 } = require("uuid");
const { Ollama } = require('ollama');
const fileUpload = require("express-fileupload");
const fs = require('fs').promises;
const server = require("http").createServer(app)
const { Remarkable } = require("remarkable");
const md = new Remarkable({
    html: true,
    breaks: true
});


//Define ollama endpoint
const ollama = new Ollama({ host: 'http://localhost:11434/' });
//Define app endpoint
const PORT = process.env.PORT || 3030;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '/views'));

//Creating web-server
const io = require("socket.io")(server, {
    "force new connection": false,
    cors: {
        origin: "*",
        methods: ['GET', 'POST', 'DELETE']
    }
});

const urlencodedParser = express.urlencoded( {extended: true});

//<-------- express params -------->

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
app.use(urlencodedParser)
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    secret: "cookie secret"
}));

//<-------- GET requests -------->

//creating an endpoint
app.get("/", async (req, res) => {
    if (req.cookies.session == null) { res.redirect("register")} 
    else { res.redirect(`/chat/${req.cookies.session}`) }
})
//api/register page
app.get("/register", async (req, res) => {
    if (req.cookies.session == null) { res.render("register") }
    else { res.redirect(`/chat/${req.cookies.session}`) }
})
//api/login page
app.get("/login", async (req, res) => { 
    if (req.cookies.session == null) {res.render("login") }
    else { res.redirect(`/chat/${req.cookies.session}`) }
})
//Get chats
app.get('/api/get-chats/:id', urlencodedParser, async (req, res) => {
    const { id } = req.params;
    db.getChats(id).then((result) => {
        res.status(200).send({ message: result})
        console.log(result)
    })
})
//Chat page
app.get("/chat/:id/:chat_id", async (req, res) => { res.render("chat"); })
//Chat page
app.get("/chat/:id", async (req, res) => { res.render("chat"); }) 

app.get("/api/pull-chats", async (req, res) => {
    try {
        res.json()
    } catch (e) {
        console.log(e);
    }
})

//Pull theme
app.get('/api/get-models', urlencodedParser, (req, res) => {
    try {
        
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

//Pull theme
app.get('/api/pull-theme', urlencodedParser, (req, res) => {
    try {
        res.cookie("theme", "dark", {maxAge: 9000000, httpOnly: false})
        res.status(200).send('default theme pulled')
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

//Pull locale
app.get('/api/pull-locale', urlencodedParser, (req, res) => {
    try {
        res.cookie("locale", "en", {maxAge: 9000000, httpOnly: false})
        res.status(200).send('default locale pulled')
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

//<-------- POST requests -------->

//Creating new chat
app.post("/api/create-chat", urlencodedParser, async (req, res) => {
    try {
        console.log(req.body)
        const token = req.body.id;
        const model = req.body.model;
        console.log(token, model)
        res.cookie("current-model", model, {maxAge: 9000000, httpOnly: false})
        if (!model) {
            res.status(418).send({ message: 'Model name is required' });
            return null;
        }
        let user_id = db.getUserId(token)  
        let modelChatId = await db.createChat(user_id, model);
        await fs.writeFile(`./resources/chats/${modelChatId}.json`, "{[]}")
        await res.status(200).redirect(`/chat/${req.cookies.session}?=${modelChatId}`)
        res.end()
    } catch (e) {
        console.log(e)
        res.status(500)
    }
}) 

//User login
app.post('/api/submit-login', urlencodedParser, async (req, res) => {
    try {
        userData = req.body;
        await db.loginUser(userData.login, userData.password).then((result) => {
            if (result != undefined){
                console.log(result)
                req.session.login = userData.login
                res.cookie("session", result.token, {maxAge: 9000000, httpOnly: false})
                res.status(200).redirect(`/chat/${result.token}`).catch((e) => {
                    console.log(e)
                    redirect('/login')
                })
            } else {
                console.log("BROTHER")
                res.status(403).redirect('/login')
            }
        }).catch((e) => {
            console.log(e.message)
            console.log("BRUh")
            res.status(500)
        })
    } catch (e) {
        console.log(e)
    }
})

//User registration
app.post('/api/submit-registration', urlencodedParser, (req, res) => {
    try {
        userData = req.body;
        console.log(userData)
        db.registerUser(userData.login, userData.password).then((token) => {
            if (token != null){
                req.session.login = userData.login
                res.cookie("session", login, token, {maxAge: 9000000, httpOnly: false})
                console.log(req.cookies[0].session)
                res.status(200).redirect(`/login`)
            } else {
                res.status(403).redirect(`/register`)
            }
        }).catch((e) => {
            console.log(e.message)
            res.sendStatus(404)
        })
    } catch(e) {
        console.log(e)
        res.status(500)
    }
})
//Logout user from session
app.post("/api/logout-user", urlencodedParser, (req, res) => {
    try {
        res.clearCookie('session');
        res.clearCookie('theme');
        res.clearCookie('locale');
        res.clearCookie('current-model');
        res.send('user have logged out');
        res.status(200).redirect("/register");
    } catch (e) {
        console.log(e.message)
        res.status(500)
    }
})

//Changing theme
app.post('/change-theme', urlencodedParser, (req, res) => {
    try {
        const themeData = req.body.theme
        res.cookie("theme", themeData, {maxAge: 9000000, httpOnly: false})
        res.status(200).send(`theme changed to ${themeData}`)
    } catch(e) {
        console.log(e)
        res.status(500)
    }
})

//Changing locale
app.post('/change-locale', urlencodedParser, (req, res) => {
    try {
        const localeData = req.body.locale
        res.cookie("locale", localeData, {maxAge: 9000000, httpOnly: false})
        res.status(200).send(`locale changed to ${localeData}`)
    } catch(e) {
        console.log(e)
        res.status(500)
    }
})

//Upload file
app.post('/api/upload', fileUpload({ createParentPath: true }), (req, res) => {
    try {
        const files = req.files;
        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, '../resources/uploads', files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: "error", message: err})
            })
        })
        res.status(200).json({ status: "success", message: Object.keys(files).toString})
    } catch (e) {
        console.log(e)
        res.status(500)
    }

})
//Pulling model
app.post('/api/pull-model', urlencodedParser, async (req, res) => {
    try {
        modelData = req.body;
        console.log(modelData)
        db.addModel(modelData.model).then(async () => {
        await ollama.pull(modelData.model).then(result => {
            console.log(result)
        })
    })
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

//<-------- DELETE requests -------->
//Deleting model
app.delete('/api/delete-model', urlencodedParser, async (req, res) => {
    try {
        modelData = req.body;
        console.log(req)
        await ollama.delete(modelData.model)
    } catch (e) {
        console.log(e)
    }
})
//Deleting chat
app.delete('/delete-chat', urlencodedParser, (req, res) => {
    try {
        db.deleteChat(chat_id)
    } catch (e) {
        console.log(e)
    }
})

//Socket.IO

io.on('connection', (socket) => {
    console.log('Client connected');
    var response;
    //getting user messages
    socket.on('message', async(message, model) => {
        try {
            let uuid = uuidv4()
            console.log(`new message: ${message}`)
            const messagesBody = [];
            const messageBody = {
                role: 'user',
                content: message
            }
            messagesBody.push(messageBody)
            console.log(messagesBody)
            const response = await ollama.chat({
                model: model,
                messages: messagesBody,
                stream: true
            })
            //sending response start
            socket.emit('responseStart', model, uuid)
            let model_response;
            //sending response
            for await (const part of response) {
                if (part.message.content) {
                    if (part.message.content != null || part.message.content != undefined || part.message.content == "undefined") {
                        model_response += part.message.content
                        socket.emit('responseMiddle', md.render(model_response), uuid);
                    }
                } else {
                    //ending response
                    socket.emit('responseEnd', part, uuid)
                }
            }
        } catch(e) {
            console.log(e)
        }        
    })    
    //unloading model
    socket.on("unloadModel", async(modelName) => {
        const unloadModel = {
            "model": modelName,
            "keep-alive": 0       
        }
        await fetch(ollama, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unloadModel)
        })
        .then(res => {
            if(!res.ok) {
                console.log(res)
                return;
            }
            return res.json()
        .then(data => {
            console.log(data);
        })
        .catch(error => console.log(error))})
    })
    //catching disconnected users
    socket.on('disconnect', () => {
        console.log("Client has disconnected")
    })
})

//Catching errors
io.engine.on("connection-error", (err) => {
    console.log(err.code);
    console.log(err.message);
})
//More error catching
io.engine.on("error", (err) => {
    console.log(err)
})
//Making server listen on current PORT
server.listen(PORT, () => console.log(`Started! Listening on ${PORT}`))
