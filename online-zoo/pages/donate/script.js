let emailInput = document.querySelector('.subscribe__input')
let subscribeButton = document.querySelector('.subscribe__btn')
let numberInput = document.querySelector('.amount__input')
let dollarSign = document.querySelector('.dollar-sign')
let headerBurger = document.querySelector('.header__burger')
let navWraper = document.querySelector('.nav-wrapper')

let amountItems = document.querySelectorAll('.line__item')
let amountInput = document.querySelector('.amount__input')

amountItems.forEach((amountItem) => {
    amountItem.addEventListener('click', () => {
        amountItems.forEach((i) => {
            i.classList.remove('active');
        });

        amountItem.classList.add('active');

        let price = amountItem.querySelector('.price').innerHTML;
        price = price.slice(1)

        amountInput.value = price;
    });
});


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

numberInput.addEventListener('keydown', (e) => {
    if (numberInput.value.toString().length > 3) {
        if (e.code.toString().includes('Digit')) {
            e.preventDefault();
            return false;
        }
    }
})

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