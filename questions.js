const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const Q_TYPE_SELECT = "SELECT";
const Q_TYPE_NUMERIC = "NUMERIC";
const Q_TYPE_TEXT = "TEXT";

const QUESTION_TYPES = {
    Q_TYPE_SELECT,
    Q_TYPE_NUMERIC,
    Q_TYPE_TEXT,
}

const generateId = function() {
    return crypto.randomBytes(6).toString('hex');
};

let questions = [
    {
        "id": "1d1248add827",
        "type": Q_TYPE_SELECT,
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

let currentQuestionId = questions[0].id;


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
    res.redirect("/admin");
});

router.route("/:id/answer").post((req, res) => {
    let id = req.params.id
    let idx = questions.findIndex(item => item.id === id);

    if(idx == -1) {
        res.send({
            success: false,
            error: "Question not found"
        });
    }

    questions[idx].answers.push(req.body.answer);

    console.log(questions);

    res.send({
        success: true
    });
});

router.route("/new").post((req, res) => {
    let id = generateId()
    let idx = questions.findIndex(item => item.id === id);
    
    while(idx != -1) {
        id = generateId();
    }


    let question = {
        "id": id,
        "type": req.body.type,
        "question": req.body.question,
        "answers": []
    };

    if (question.type == Q_TYPE_SELECT) {
        question.options = req.body.options.split(',')
    }

    questions.push(question);
    res.redirect("/admin");
});


module.exports = {
    QUESTION_TYPES,
    router,
    questions,
    getCurrentQuestion: function() {
        return questions.find(item => item.id === currentQuestionId);
    },
    getCurrentQuestionId: function() {
        return currentQuestionId;
    },
    getQuestionById: function(id) {
        return questions.find(item => item.id === id);
    }
};