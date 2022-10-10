const wrapper = document.querySelector('.slider-wrapper');
const container = document.querySelector('.testimonials__items');
const items = container.querySelectorAll('.testimonials__item')
const range = document.querySelector('.slider-range')

const MIN_WIDTH_MAP = [
    [1300, 4],
    [907, 3],
    [0, null],
]

function getAmount(width) {
    return MIN_WIDTH_MAP.find(i => width > i[0])[1];
}

function setup() {
    const itemAmount = getAmount(window.innerWidth)

    if (!itemAmount) {
        container.style.marginLeft = `0px`;
        wrapper.style.width = `inherit`;

        return;
    }

    const margins = +window.getComputedStyle(items[0]).marginRight.replace('px', '');
    const minWidth = items[0].clientWidth * itemAmount + margins * (itemAmount - 1);

    wrapper.style.width = `${minWidth}px`;
}

window.addEventListener('resize', () => {
    setup();
})

range.addEventListener('input', () => {
    const margins = +window.getComputedStyle(items[0]).marginRight.replace('px', '');
    const offset = items[0].clientWidth + margins;
    container.style.marginLeft = `-${range.value * offset}px`;
});

setup();