const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");
const morgan = require("morgan");

// -----------------//
//      INIT        //
// -----------------//

// create app instance 
const app = express();
const port = 3000;

// use morgan middleware for logging
app.use(morgan("tiny"));

// for easier parsing of request body for POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use("/css", express.static(path.join(__dirname, "public", "style")));
app.use("/js", express.static(path.join(__dirname, "public", "scripts")));

// set views
app.set("views", "./views");
app.set("view engine", "ejs");


// --------------------------//
//      SERVER & SOCKET      //
// --------------------------//

// start server
const server = require("http").createServer(app);
server.listen(port);

// socket
const io = require("socket.io")(server);
io.on("connect", function(socket) {
    socket.on('answerSent', (payload) => {
        currentQuestion = questions.getCurrentQuestion()
        if(currentQuestion) {
            io.emit("updateResults", {
                question: currentQuestion.question,
                results: questions.calculateAnswerPercentage(currentQuestion.answers)
            });
        }
    });
    socket.on('resultLoaded', (payload) => {
        currentQuestion = questions.getCurrentQuestion()
        let sendpayload = {
            question: "Waiting for a question...",
            results: []
        }

        if(currentQuestion) {
            sendpayload = {
                question: currentQuestion.question,
                results: questions.calculateAnswerPercentage(currentQuestion.answers)
            } 
        }

        io.emit("updateResults", sendpayload);
    })
});

// -----------------//
//      ROUTES      //
// -----------------//

// question routes
const questions = require("./modules/questions.js")(io);
app.use("/question", questions.router);

// index route
app.get("/", (req, res) => {
    res.render("index", {
        question: questions.getCurrentQuestion(),
        questionTypes: questions.QUESTION_TYPES,
    });
});

// admin page route
app.get("/admin", basicAuth({
    challenge: true,
    users: {
        'admin': 'admin',
    }
}),(req, res) => {
    res.render("admin", {
        questions: questions.questions,
        questionTypes: questions.QUESTION_TYPES,
        currentQuestionId: questions.getCurrentQuestionId(),
    });
});

// result page route
app.get("/result", (req, res) => {
    res.render("result");
});

