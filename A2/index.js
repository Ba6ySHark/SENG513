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
        if (this.getCurrentQuestion().isCorrectAnswer.call(this.getCurrentQuestion(), answer)) {
        // Use `call` to invoke the isCorrectAnswer method explicitly with the correct context
        this.score++;
        }
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
  
      // Use bind to preserve the correct `this` in the callbacks
      this.submitButton.addEventListener('click', this.submitAnswer.bind(this));
      this.nextButton.addEventListener('click', this.showNextQuestion.bind(this));
    }
  
    showQuestion(question) {
        this.questionElement.innerHTML = question.text;
        this.choicesContainer.innerHTML = '';
      
        // Clear any previous event listeners
        const choiceButtons = Array.from(this.choicesContainer.querySelectorAll('button'));
        choiceButtons.forEach(button => button.removeEventListener('click', this.handleChoice));
      
        // Create new buttons for each choice
        question.choices.forEach(choice => {
          const choiceButton = document.createElement('button');
          choiceButton.innerText = choice;
      
          // Add event listener for each choice, bind the correct context
          choiceButton.addEventListener('click', () => this.handleChoice(choice));
      
          this.choicesContainer.appendChild(choiceButton);
        });
      }      
  
    // Method to handle user choice
    handleChoice(choice) {
      // Use call to invoke isCorrectAnswer with correct context
      if (this.quiz.getCurrentQuestion().isCorrectAnswer.call(this.quiz.getCurrentQuestion(), choice)) {
        this.user.updateScore();
        alert('Correct!');
      } else {
        alert('Wrong!');
      }
    }
  
    submitAnswer() {
      const selectedChoice = this.choicesContainer.querySelector('button.active').innerText;
  
      // Use bind to ensure `this` is preserved when `guess` is called
      this.quiz.guess.bind(this.quiz)(selectedChoice);
      this.updateScore();
    }
  
    updateScore() {
      // No need to use bind, call, or apply here, but you could if needed
      this.scoreElement.innerText = `Score: ${this.user.score}`;
    }
  
    showNextQuestion() {
      if (!this.quiz.isFinished()) {
        // Use apply to dynamically call showQuestion with the next question
        this.showQuestion.apply(this, [this.quiz.getCurrentQuestion()]);
      } else {
        this.showFinalScore.call(this); // Use call to invoke the function immediately with this context
      }
    }
  
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