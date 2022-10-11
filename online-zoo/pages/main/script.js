let emailInput = document.querySelector('.subscribe__input')
let subscribeButton = document.querySelector('.subscribe__btn')
let headerBurger = document.querySelector('.header__burger')
let navWraper = document.querySelector('.nav-wrapper')
let backgroundWrapper = document.querySelector('.background__wrapper')

const testimonialsItems = document.querySelectorAll('.testimonials__item')
const testimonialsPopup = document.querySelector('.testimonials__popup')
const exitPopup = document.querySelector('.popup__exit')

emailInput.addEventListener('input', () => {
    if (emailInput.value == '') {
        subscribeButton.classList.remove('invalid')
        subscribeButton.classList.remove('valid')
        return;
    }

    if (!emailInput.checkValidity()) {
        subscribeButton.classList.add('invalid')
    } else {
        subscribeButton.classList.remove('invalid')
        subscribeButton.classList.add('valid')
    }
});

headerBurger.addEventListener ('click', () => {
    headerBurger.classList.toggle('active')
    backgroundWrapper.classList.toggle('active')
    navWraper.classList.toggle('active')
})

testimonialsItems.forEach((item) => {
    let itemClone;
    item.addEventListener('click', () => {
        testimonialsPopup.style.display = 'block'
        itemClone = item.cloneNode(true)
        testimonialsPopup.appendChild(itemClone)
    });

    exitPopup.addEventListener('click', () => {
        itemClone.remove();
        testimonialsPopup.style.display = 'none'
    })
});