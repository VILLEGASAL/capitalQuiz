import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

let quiz = [];

const db = new pg.Pool({

  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DBPORT,
  database: process.env.DATABASE,
  ssl:{

    require: true,
    rejectUnauthorized: false
  }
});

let totalCorrect = 0;
let isCorrect = true;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};


// GET home page
app.get("/", async (req, res) => {

  try {

    if(isCorrect){

      await nextQuestion();
      res.status(200).render("index.ejs", { 
        question: currentQuestion, 
        totalScore: totalCorrect,
        wasCorrect: isCorrect
      });
    }else{

      res.status(200).render("index.ejs", {
        question: currentQuestion,
        totalScore: totalCorrect, 
        wasCorrect: isCorrect
      });
    }

  } catch (error) {
    
    res.status(500).json(error);
  }
  
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  
  }else{

    isCorrect = false;
  }

  res.redirect("/");
});

//RESTART
app.get("/restart", (req, res) => {

  isCorrect = true;
  totalCorrect = 0;

  res.redirect("/");
});


let nextQuestion = async() => {
  
  try {
    
    const result = await db.query(`SELECT * FROM capitals`);

    quiz = result.rows;

    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

    currentQuestion = randomCountry;

  } catch (error) {
    
    console.log(error);
  }

}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
