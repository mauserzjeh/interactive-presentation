const express = require("express");
const crypto = require("crypto");
const router = express.Router();

// question types
const Q_TYPE_OPTION = "OPTION";
const Q_TYPE_NUMERIC = "NUMERIC";
const Q_TYPE_TEXT = "TEXT";

const QUESTION_TYPES = {
    Q_TYPE_OPTION,
    Q_TYPE_NUMERIC,
    Q_TYPE_TEXT,
}

// hardcoded default questions
let questions = [
    {
        "id": "1d1248add827",
        "type": Q_TYPE_OPTION,
        "question": "What's the first letter of the alphabet?",
        "options": ["A", "B", "C", "D"],
        "answers": []
    },
    {
        "id": "32a1475cbe7e",
        "type": Q_TYPE_NUMERIC,
        "question": "How old are you?",
        "answers": []
    },
    {
        "id": "5f13a0a26dbe",
        "type": Q_TYPE_TEXT,
        "question": "What's your name?",
        "answers": []
    }
];

// default current question 
let currentQuestionId = questions[0].id;

function generateId() {
    return crypto.randomBytes(6).toString('hex');
};

function getCurrentQuestion() {
    return questions.find(item => item.id === currentQuestionId);
};

function getCurrentQuestionId() {
    return currentQuestionId;
};

function getQuestionById(id) {
    return questions.find(item => item.id === id);
};

function calculateAnswerPercentage(answers) {
    let percentages = {}
    let total = answers.length;
    for (const answer of answers) {
        percentages[answer] = percentages[answer] ? percentages[answer] + 1 : 1;
    }
    for (const [key, value] of Object.entries(percentages)) {
        percentages[key] = ((value / total) * 100).toFixed(1);
    }
    return percentages;
};

// wrap module exports into a function so we can use
// socket.io as a passed parameter
module.exports = function (io) {

    router.route("/new").post((req, res) => {
        let id = generateId()
        let idx = questions.findIndex(item => item.id === id);

        while (idx != -1) {
            id = generateId();
        }


        let question = {
            "id": id,
            "type": req.body.type,
            "question": req.body.question,
            "answers": []
        };

        if (question.type == Q_TYPE_OPTION) {
            question.options = req.body.options.split(',')
        }

        questions.push(question);
        res.redirect("/admin");
    });

    router.route("/current").get((req, res) => {
        res.send(getCurrentQuestionId());
    });

    // get question with given id
    router.route("/:id").get((req, res) => {
        let id = req.params.id;
        let question = questions.find(item => item.id === id);

        if (question == null) {
            res.send(false);
            return
        }

        res.send(question);
    });

    // set question to be the current with given index
    router.route("/:id/set").get((req, res) => {
        let id = req.params.id;
        let question = questions.find(item => item.id === id);

        if (question == null) {
            res.redirect("/admin");
            return
        }

        currentQuestionId = question.id;
        io.emit('reload', {reload: true});
        res.redirect("/admin");
    });

    router.route("/:id/reset").get((req, res) => {
        let id = req.params.id;
        let idx = questions.findIndex(item => item.id === id);

        if (idx == -1) {
            res.redirect("/admin");
            return
        }

        questions[idx].answers = [];
        io.emit('reload', {reload: true});
        res.redirect("/admin");
    });

    router.route("/:id/del").get((req, res) => {
        let id = req.params.id;
        let idx = questions.findIndex(item => item.id === id);

        if (idx == -1) {
            res.redirect("/admin");
            return
        }

        questions.splice(idx, 1);
        io.emit('reload', {reload: true});
        res.redirect("/admin");
    });

    router.route("/:id/answer").post((req, res) => {
        let id = req.params.id
        let idx = questions.findIndex(item => item.id === id);

        if (idx == -1) {
            res.send({
                success: false,
                error: "Question not found"
            });
            return
        }

        questions[idx].answers.push(req.body.answer);
        res.send({
            success: true
        });
    });


    // export module
    let module = {
        QUESTION_TYPES,
        router,
        questions,
        getCurrentQuestion,
        getCurrentQuestionId,
        getQuestionById,
        calculateAnswerPercentage
    }
    return module;
};