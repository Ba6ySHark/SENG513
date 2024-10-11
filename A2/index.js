// Question class
class Question {
    constructor(text, choices, correctAnswer) {
      this.text = text;
      this.choices = choices;
      this.correctAnswer = correctAnswer;
    }
  
    isCorrectAnswer(choice) {
      return this.correctAnswer === choice;
    }
}
  
// User class
class User {
    constructor(username) {
        this.username = username;
        this.score = 0;
    }

    updateScore() {
        this.score++;
    }
}

// Quiz class
class Quiz {
    constructor(questions) {
      this.questions = questions;
      this.currentQuestionIndex = 0;
      this.score = 0;
    }
  
    getCurrentQuestion() {
      return this.questions[this.currentQuestionIndex];
    }
  
    isFinished() {
      return this.currentQuestionIndex >= this.questions.length;
    }
  
    guess(answer) {
      if (this.getCurrentQuestion().isCorrectAnswer(answer)) {
        this.score++;
      }
      // Increment the question index to move to the next question
      this.currentQuestionIndex++;
    }
  }  

function* questionGenerator(quiz) {
    while (!quiz.isFinished()) {
      yield quiz.getCurrentQuestion();
    }
}


async function fetchQuestions() {
    const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple');
    const data = await response.json();
    const questions = data.results.map(q => {
      return new Question(q.question, [...q.incorrect_answers, q.correct_answer], q.correct_answer);
    });
    return questions;
}

class QuizUI {
    constructor(quiz, user) {
      this.quiz = quiz;
      this.user = user;
      this.submitButton = document.getElementById('submit');
      this.choicesContainer = document.getElementById('choices');
      this.questionElement = document.getElementById('question');
      this.scoreElement = document.getElementById('score');
      this.nextButton = document.getElementById('next');
  
      // Bind event handlers to `this`
      this.submitButton.addEventListener('click', this.submitAnswer.bind(this));
      this.nextButton.addEventListener('click', this.showNextQuestion.bind(this));
  
      // Start by showing the first question
      this.showQuestion(this.quiz.getCurrentQuestion());
    }
  
    // Method to display the question and choices
    showQuestion(question) {
      this.questionElement.innerHTML = question.text;
      this.choicesContainer.innerHTML = '';
  
      // Create buttons for each choice
      question.choices.forEach(choice => {
        const choiceButton = document.createElement('button');
        choiceButton.innerText = choice;
  
        // Handle the user's choice
        choiceButton.addEventListener('click', () => this.handleChoice(choice));
        this.choicesContainer.appendChild(choiceButton);
      });
  
      // Show the submit button and hide the next button initially
      this.submitButton.style.display = 'inline';
      this.nextButton.style.display = 'none';
    }
  
    // Handle the user choice, show the correct alert, and allow moving to the next question
    handleChoice(choice) {
      const buttons = this.choicesContainer.querySelectorAll('button');
      buttons.forEach(button => button.disabled = true);
  
      if (this.quiz.getCurrentQuestion().isCorrectAnswer(choice)) {
        this.user.updateScore();
        alert('Correct!');
      } else {
        alert('Wrong!');
      }
  
      // Show the "Next" button and hide "Submit" after answering
      this.submitButton.style.display = 'none';
      this.nextButton.style.display = 'inline';
    }
  
    // Submit the current answer and move to the next question
    submitAnswer() {
      const selectedChoice = this.choicesContainer.querySelector('button.active');
      if (selectedChoice) {
        this.quiz.guess(selectedChoice.innerText);
        this.updateScore();
      }
  
      this.submitButton.style.display = 'none';
      this.nextButton.style.display = 'inline';
    }
  
    // Update the score display
    updateScore() {
      this.scoreElement.innerText = `Score: ${this.user.score}`;
    }
  
    // Show the next question or the final score if the quiz is finished
    showNextQuestion() {
      if (!this.quiz.isFinished()) {
        // Move to the next question
        this.showQuestion(this.quiz.getCurrentQuestion());
  
        // Reset the buttons for the next question
        this.submitButton.style.display = 'inline';
        this.nextButton.style.display = 'none';
      } else {
        this.showFinalScore();
      }
    }
  
    // Show the final score at the end of the quiz
    showFinalScore() {
      alert(`Final Score: ${this.user.score}`);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = new User('Player1');
    const questions = await fetchQuestions();
    const quiz = new Quiz(questions);
    const quizUI = new QuizUI(quiz, user);
  
    const questionGen = questionGenerator(quiz);
    const firstQuestion = questionGen.next().value;
    quizUI.showQuestion(firstQuestion);
});