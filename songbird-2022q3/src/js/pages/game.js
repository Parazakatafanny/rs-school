import anonBird from '../../assets/anon-bird.png';
import falseAnswer from '../../assets/audio/false.mp3';
import trueAnswer from '../../assets/audio/true.mp3';
import birdsDataRu from '../../data/birdsRu.js';
import birdsDataEng from '../../data/birdsEng.js';
import { constuctPlayer } from '../components/player.js';

let gameContainer = document.querySelector('.game__inner');
let gameScore = document.querySelector('.game__score');
let btnNext = document.querySelector('.next-lvl');

let randomBird = Math.floor(Math.random() * 6);
let questionNumber = 0;
const maxPoints = 5;
let score = 0;
let isAnswered = false;
let aboutBird;
let aboutGame;
let questionName;
let questionImg;
let gameAnswers;
let question;
let questAudio;
let birdsData = 
  localStorage.getItem('lang') == 'ru' 
    ? birdsDataRu
    : birdsDataEng;

export function onLangChange(lang) {
    if (lang == 'ru') {
      birdsData = birdsDataRu;
      constructGame();
    } else if (lang == 'eng') {
      birdsData = birdsDataEng;
      constructGame();
    }
}

export function constructGame() {

  createQuestion();


  btnNext.addEventListener('click', (e) => {
    if (!isAnswered) {
      e.preventDefault();
      return;
    }

    if (questionNumber == 5) {
      createResults();
    }

    randomBird = Math.floor(Math.random() * 6);

    isAnswered = false;
    btnNext.classList.remove('active-btn');
    aboutBird?.remove();
    document.querySelectorAll('.progress__item')[questionNumber].classList.remove('active');
    questionNumber += 1;
    document.querySelectorAll('.progress__item')[questionNumber].classList.add('active');
    createQuestion();
    renderArswers();
  })
}

function createQuestion() {
  question?.remove();

  question = document.createElement('div');
  question.classList.add('game__question');
  gameContainer.appendChild(question);

  let questionAbout = document.createElement('div');
  questionAbout.classList.add('question__about');

  let questionImgBlock = document.createElement('div');
  questionImgBlock.classList.add('question__img');
  question.appendChild(questionImgBlock);
  question.appendChild(questionAbout);

  questionImg = document.createElement('img');
  questionImg.classList.add('img-bird');
  questionImg.src = anonBird;
  questionImg.alt = 'anon bird';
  questionImgBlock.appendChild(questionImg);

  questionName = document.createElement('div');
  questionName.classList.add('question__name');
  questionName.innerHTML = '*******';
  questionAbout.appendChild(questionName);
  constuctPlayer(questionAbout,birdsData[questionNumber][randomBird].audio)

  renderArswers();
}

function renderArswers() {
  gameAnswers?.remove();
  gameAnswers = document.createElement('div');
  gameAnswers.classList.add('game__answers');
  gameContainer.appendChild(gameAnswers);

  let answers = document.createElement('div');
  answers.classList.add('answers');
  gameAnswers.appendChild(answers);

  let pointsToEarn = maxPoints;

  for (let i = 0; i < birdsData[questionNumber].length; i++) {

    let answerItem = document.createElement('div');
    answerItem.classList.add('game__item');

    answerItem.addEventListener('click', () => {
      if (!isAnswered && birdsData[questionNumber][randomBird].id == birdsData[questionNumber][i].id) {
        questionName.innerHTML = birdsData[questionNumber][randomBird].name;
        questionImg.src = birdsData[questionNumber][randomBird].image;
        questionImg.alt = birdsData[questionNumber][randomBird].name;

        let questAudio = document.querySelector('.audio-player audio');
        let iconPlay = document.querySelector('.audio-play');
        let iconStop = document.querySelector('.audio-stop');
        iconPlay.style.display = 'block';
        iconStop.style.display = 'none';

        questAudio.pause();

        let audio = new Audio(trueAnswer);
        audio.play();

        isAnswered = true;
        answerItem.style.background = '#177f170f';
        answerInput.style.background = '#1a7d1560';
        btnNext.classList.add('active-btn');

        if (pointsToEarn > 0) {
          score += pointsToEarn;
        }

      } else if (!isAnswered) {
        let audio = new Audio(falseAnswer);
        audio.play();
        pointsToEarn -= 1;
        answerInput.style.background = '#8d161673';
      }

      aboutGame?.remove();
      if (localStorage.getItem('lang') == 'ru') {
        gameScore.innerHTML = `Счет: ${score}`;
      } else if (localStorage.getItem('lang') == 'eng') {
        gameScore.innerHTML = `Score: ${score}`;
      }
      renderAbouBird(i);
    })

    const answerInput = document.createElement('div');
    answerInput.classList.add('bird-name__input');

    const answerLabel = document.createElement('p');
    answerLabel.classList.add('bird-name');
    answerLabel.innerHTML = birdsData[questionNumber][i].name;

    answers.appendChild(answerItem);
    answerItem.appendChild(answerInput);
    answerItem.appendChild(answerLabel);
  }

  aboutGame = document.createElement('div');
  aboutGame.classList.add('about-game');

  if (localStorage.getItem('lang') == 'ru') {
    aboutGame.innerHTML = 'Послушайте, какая птица поет <br> и выберите ответ';
  } else if (localStorage.getItem('lang') == 'eng') {
    aboutGame.innerHTML = 'Listen to what kind of bird is singing <br> and choose the answer';
  }

  gameAnswers.appendChild(aboutGame);
}

function renderAbouBird(index) {
  aboutBird?.remove();

  aboutBird = document.createElement('div');
  aboutBird.classList.add('about-bird');
  gameAnswers.appendChild(aboutBird);

  let aboutBirdInner = document.createElement('div');
  aboutBirdInner.classList.add('about-bird__inner');
  aboutBird.appendChild(aboutBirdInner);

  let birdImgBlock = document.createElement('div');
  birdImgBlock.classList.add('about-bird__img-block');
  aboutBirdInner.appendChild(birdImgBlock);

  let birdImg = document.createElement('img');
  birdImg.src = birdsData[questionNumber][index].image;
  birdImg.classList.add('about-bird__img');
  birdImgBlock.appendChild(birdImg);

  let aboutTheBird = document.createElement('div');
  aboutTheBird.classList.add('about-bird__about');
  aboutBirdInner.appendChild(aboutTheBird);

  let birdName = document.createElement('h2');
  birdName.classList.add('about-bird__name');
  birdName.innerHTML = birdsData[questionNumber][index].name;
  aboutTheBird.appendChild(birdName);

  let birdSecondName = document.createElement('h3');
  birdSecondName.classList.add('about-bird__second-name');
  birdSecondName.innerHTML = birdsData[questionNumber][index].species;
  aboutTheBird.appendChild(birdSecondName);

  let birdAudio = document.createElement('div');
  birdAudio.classList.add('about-bird__audio');
  constuctPlayer(birdAudio, birdsData[questionNumber][index].audio);
  aboutTheBird.appendChild(birdAudio);

  let aboutBirdText = document.createElement('div');
  aboutBirdText.classList.add('about-bird__text');
  aboutBirdText.innerHTML = birdsData[questionNumber][index].description;
  aboutBird.appendChild(aboutBirdText);
}



function createResults() {
  let results = document.querySelector('.results');
  results.style.display = 'flex';
  let gameWindow = document.querySelector('.game__window');
  gameWindow.style.display = 'none';
  let resultsWindow = document.querySelector('.results__sub-title');

  if (localStorage.getItem('lang') == 'ru') {
    resultsWindow.innerHTML = `Ты набрал ${score} из 30`;
  } else if (localStorage.getItem('lang') == 'eng') {
    resultsWindow.innerHTML = `You scored ${score} out of 30`;
  }

  let gameBtn = document.querySelector('.results__btn');
  gameBtn.addEventListener('click', () => {
    gameWindow.style.display = 'block';
    questionNumber = 0;
    document.querySelectorAll('.progress__item')[questionNumber].classList.add('active');
    score = 0;
    gameScore.innerHTML = `Score: ${score}`;
    createQuestion();
  })
}