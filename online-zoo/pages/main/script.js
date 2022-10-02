let emailInput = document.querySelector('.subscribe__input')
let subscribeButton = document.querySelector('.subscribe__btn')
let headerBurger = document.querySelector('.header__burger')
let navWraper = document.querySelector('.nav-wrapper')

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
    navWraper.classList.toggle('active')
})