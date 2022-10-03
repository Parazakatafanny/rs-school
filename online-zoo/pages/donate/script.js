let emailInput = document.querySelector('.subscribe__input')
let subscribeButton = document.querySelector('.subscribe__btn')
let numberInput = document.querySelector('.amount__input')
let dollarSign = document.querySelector('.dollar-sign')
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

numberInput.addEventListener('input', () => {
    if (numberInput.value == '') {
        dollarSign.classList.remove('invalid__dollar')
        dollarSign.classList.remove('valid__dollar')
        return;
    }

    if (!numberInput.checkValidity()) {
        dollarSign.classList.remove('valid__dollar')
        dollarSign.classList.add('invalid__dollar')
    } else {
        dollarSign.classList.remove('invalid__dollar')
        dollarSign.classList.add('valid__dollar')
    }
})

headerBurger.addEventListener ('click', () => {
    headerBurger.classList.toggle('active')
    navWraper.classList.toggle('active')
})