import birdsDataRu from '../../data/birdsRu.js';
import birdsDataEng from '../../data/birdsEng.js';
import { constuctPlayer } from '../components/player.js';

let birdsData = 
  localStorage.getItem('lang') == 'ru' 
    ? birdsDataRu
    : birdsDataEng;

export function renderGallery() {
  let gallery = document.querySelector('.gallery__inner');

  for (let i = 0; i < birdsData.length; i++) {
    for (let j = 0; j < birdsData[i].length; j++) {

      let galleryItem = document.createElement('div');
      galleryItem.classList.add('gallery__item');
      gallery.appendChild(galleryItem);

      let galleryImg = document.createElement('img');
      galleryImg.classList.add('gallery__img');
      galleryImg.src = birdsData[i][j].image;
      galleryImg.alt = birdsData[i][j].name;

      galleryItem.appendChild(galleryImg);

      galleryItem.addEventListener('click', () => {
        birdsData = localStorage.getItem('lang') == 'ru' 
                    ? birdsDataRu
                    : birdsDataEng;
        renderderPopup(i, j);
      })
    }
  }
}

function renderderPopup(i, j) {
  let popupBack = document.querySelector('.popup__back');
  popupBack.style.display = 'block';

  let popup = document.createElement('div');
  popup.classList.add('popup');
  popup.classList.add('flex-col-center');
  popupBack.appendChild(popup);

  let popupAbout = document.createElement('div');
  popupAbout.classList.add('popup__about-bird');
  popup.appendChild(popupAbout);

  let popupImg = document.createElement('img');
  popupImg.classList.add('popup__img');
  popupImg.src = birdsData[i][j].image;
  popupImg.alt = birdsData[i][j].name;
  popupAbout.appendChild(popupImg);

  let popupText = document.createElement('p');
  popupText.classList.add('popup__text');
  popupText.innerHTML = birdsData[i][j].description;
  popupAbout.appendChild(popupText);

  let popupTitle = document.createElement('h1');
  popupTitle.classList.add('popup__title');
  popupTitle.innerHTML = birdsData[i][j].name;
  popup.appendChild(popupTitle);

  let popupSubTitle = document.createElement('h4');
  popupSubTitle.classList.add('popup__sub-title');
  popupSubTitle.innerHTML = birdsData[i][j].species;
  popup.appendChild(popupSubTitle);
  constuctPlayer(popup, birdsData[i][j].audio);

  let popupExit = document.querySelector('.popup__x');
  popupExit.addEventListener('click', () => {
    popup.remove();
    popupBack.style.display = 'none';
  })

  let inputLang = document.querySelector('#language-toggle');
  inputLang.addEventListener('click', () => {
    popup.remove();
    popupBack.style.display = 'none';
  })
}