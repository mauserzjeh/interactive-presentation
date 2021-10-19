const express = require("express");
const path = require("path");
const morgan = require("morgan");

// create app instance 
const app = express();
const port = 3000;

// use morgan for logging
app.use(morgan("tiny"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use("/css", express.static(path.join(__dirname, "public", "style")));

// set views
app.set("views", "./views");
app.set("view engine", "ejs");

// routes
const questions = require("./questions.js");
app.use("/question", questions.router);

app.get("/", (req, res) => {
    res.render("index", {
        question: questions.getCurrentQuestion(),
        questionTypes: questions.QUESTION_TYPES,
        currentQuestionId: questions.getCurrentQuestionId(),
    });
});

app.get("/admin", (req, res) => {
    res.render("admin", {
        questions: questions.questions,
        questionTypes: questions.QUESTION_TYPES,
        currentQuestionId: questions.getCurrentQuestionId(),
    });
});


// start server
const server = require("http").createServer(app);
server.listen(port);

const io = require("socket.io")(server);
const connectionHandler = function(socket) {

};
io.on("connect", connectionHandler);

