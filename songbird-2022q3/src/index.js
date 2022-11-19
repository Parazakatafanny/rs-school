import "./style.scss";

import { constructGame, onLangChange } from './js/pages/game.js';
import { renderGallery } from './js/pages/index.js';
import { langRu } from './js/components/language.js';
import { langEng } from './js/components/language.js';



if (window.location.pathname.includes('game.html')) {
  constructGame();
} else {
  renderGallery();
}

let headerBurger = document.querySelector('.header__burger');
let headerMenu = document.querySelector('.header__menu');
let burgerBack = document.querySelector('.burger__back');

headerBurger.addEventListener ('click', () => {
  headerBurger.classList.toggle('active-burger');
  headerMenu.classList.toggle('active-header');
  burgerBack.classList.toggle('active-back');
});

let lang = localStorage.getItem('lang');
let langMap = langRu;
let inputLang = document.querySelector('#language-toggle');

if (lang == 'eng') {
  inputLang.checked = true;
  langMap = langEng;
}

inputLang.addEventListener('change', () => {
    lang = lang == 'ru' ? 'eng' : 'ru';
    if (lang == 'eng') {
      langMap = langEng;
    } else if (lang == 'ru') {
      langMap = langRu;
    }

    localStorage.setItem('lang', lang);
    translatePage();

    if (window.location.pathname.includes('game.html')) {
      onLangChange(lang);
    }
});

translatePage();

function translatePage() {
  let allTranslateBlocks = Array.from(document.querySelectorAll('.translate'));
  allTranslateBlocks.forEach((item) => {
    let itemId = item.getAttribute('id');
    let langValue = langMap[itemId];
    if (!langValue) {
      return;
    } 
    item.innerHTML = langValue;
  })
}