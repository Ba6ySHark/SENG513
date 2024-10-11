class User {
    constructor(username) {
        this.username = username;
        this.score = 0;
    }

    updateScore() {
        this.score++;
    }
}

class Quiz {
    constructor(questions) {
      this.questions = questions;
      this.currentQuestionIndex = 0;
    }

    incrementQuestionIndex() {
        this.currentQuestionIndex++;
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    isFinished() {
      return this.currentQuestionIndex >= this.questions.length;
    }

    guess(answer) {
      return this.getCurrentQuestion().isCorrectAnswer(answer);
    }
}

class QuizUI {
    constructor(quiz, user) {
      this.quiz = quiz;
      this.user = user;
      this.greetingSplash = document.getElementById('greeting');
      this.submitButton = document.getElementById('submit');
      this.choicesContainer = document.getElementById('choices');
      this.questionElement = document.getElementById('question');
      this.scoreElement = document.getElementById('score'); // Grab the score element from the HTML
      this.nextButton = document.getElementById('next');

      this.submitButton.addEventListener('click', this.submitAnswer.bind(this));
      this.nextButton.addEventListener('click', this.showNextQuestion.bind(this));

      this.greetingSplash.innerHTML = `Hello, ${this.user.username}`

      this.showQuestion(this.quiz.getCurrentQuestion());
      this.updateScore();
    }

    showQuestion(question) {
      this.questionElement.innerHTML = question.text;
      this.choicesContainer.innerHTML = '';

      question.choices.forEach(choice => {
        const choiceButton = document.createElement('button');
        choiceButton.innerText = choice;

        choiceButton.addEventListener('click', () => this.handleChoice(choice));
        this.choicesContainer.appendChild(choiceButton);
      });

      this.submitButton.style.display = 'inline';
      this.nextButton.style.display = 'none';
    }

    handleChoice(choice) {
      const buttons = this.choicesContainer.querySelectorAll('button');
      buttons.forEach(button => button.disabled = true);

      if (this.quiz.guess(choice)) {
        this.user.updateScore();
        alert('Correct!');
      } else {
        alert('Wrong!');
      }

      this.submitButton.style.display = 'none';
      this.nextButton.style.display = 'inline';

      this.updateScore();
    }

    submitAnswer() {
      this.submitButton.style.display = 'none';
      this.nextButton.style.display = 'inline';
    }

    updateScore() {
      this.scoreElement.innerText = `Score: ${this.user.score}`;
    }

    showNextQuestion() {
      this.quiz.incrementQuestionIndex();
      if (!this.quiz.isFinished()) {
        this.showQuestion(this.quiz.getCurrentQuestion());
        this.submitButton.style.display = 'inline';
        this.nextButton.style.display = 'none';
      } else {
        this.showFinalScore();
      }
    }

    showFinalScore() {
      alert(`Final Score: ${this.user.score}`);
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

document.addEventListener('DOMContentLoaded', async () => {
    const user = new User('Red Banana');
    const questions = await fetchQuestions();
    const quiz = new Quiz(questions);
    const quizUI = new QuizUI(quiz, user);
});