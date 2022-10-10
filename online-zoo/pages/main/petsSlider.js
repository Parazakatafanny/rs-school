let petscards = document.querySelectorAll('.pets__card');
let petsInner = document.querySelectorAll('.pets__inner');
let petsSlider = document.querySelectorAll('.pets__slider');
let slideLeft = document.querySelector('.slide__left')
let slideRight = document.querySelector('.slide__right')
let slider = document.querySelector('.slider')

let reference = document.querySelector('.pets__slide.ref')

let currentItem = 0;
let isEnabled = true;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


function getSlide() {
    let slide = reference.cloneNode(true);
    let cards = Array.from(slide.querySelectorAll('.pets__card'))
    shuffleArray(cards);

    let above = slide.querySelector('.pets__above')
    let below = slide.querySelector('.pets__below')

    cards.slice(0, 3).forEach((card) => {
        above.appendChild(card)
    })

    cards.slice(3).forEach((card) => {
        below.appendChild(card)
    })

    slide.classList.remove('ref');

    return slide;
}

let activeSlide = document.querySelector('.pets__slide:not(.ref)');

function previousItem(n) {
    let slide = getSlide()
    let slideWidth = activeSlide.clientWidth;

    const previousSlide = activeSlide;
    activeSlide = slide;

    slide.style.transition = 'margin-left .4s linear';
    slide.style.marginLeft = `-${slideWidth}px`;
    slide.addEventListener('transitionend', () => {
        previousSlide.remove();
        isEnabled = true;
    });
    slider.prepend(slide)

    setTimeout(() => {
        slide.style.marginLeft = `0px`;
    }, 0)
}

function nextItem(n) {
    let slide = getSlide()
    let slideWidth = activeSlide.clientWidth;

    const previousSlide = activeSlide;
    activeSlide = slide;

    previousSlide.style.transition = 'margin-left .4s linear';
    previousSlide.addEventListener('transitionend', () => {
        previousSlide.remove();
        isEnabled = true;
    });
    slider.appendChild(slide)

    setTimeout(() => {
        previousSlide.style.marginLeft = `-${slideWidth}px`;
    }, 0)
}

slideLeft.addEventListener('click', function() {
    if (isEnabled) {
        isEnabled = false;
        previousItem(currentItem)
    }
})

slideRight.addEventListener('click', function() {
    if (isEnabled) {
        isEnabled = false;
        nextItem(currentItem)
    }
})