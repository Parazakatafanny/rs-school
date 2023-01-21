import CartSVG from '@/assets/car.svg';
import NestedComponent from '../nested-component';

export interface WinnerData {
  idx: number;
  color: string;
  name: string;
  wins: number;
  bestTime: number;
}

export class WinnerComponent extends NestedComponent {
  private winnerData?: WinnerData;

  constructor(parentNode: HTMLElement, winnerData: WinnerData) {
    super(parentNode);
    this.winnerData = winnerData;
  }

  public render() {
    if (!this.winnerData) throw new Error();

    const winner = document.createElement('div');
    winner.classList.add('winner__item');
    this.parentNode.appendChild(winner);

    const number = document.createElement('div');
    number.classList.add('number');
    number.textContent = `${this.winnerData?.idx}`;
    winner.appendChild(number);

    const car = document.createElement('div');
    car.classList.add('car');
    car.innerHTML = CartSVG;
    winner.appendChild(car);

    const carSvg = car.querySelector('svg')!;
    carSvg.setAttribute('fill', this.winnerData?.color);

    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = `${this.winnerData?.name}`;
    winner.appendChild(name);

    const wins = document.createElement('div');
    wins.classList.add('wins');
    wins.textContent = `${this.winnerData?.wins}`;
    winner.appendChild(wins);

    const bestTime = document.createElement('div');
    bestTime.classList.add('best-time');
    bestTime.textContent = `${this.winnerData?.bestTime}`;
    winner.appendChild(bestTime);
  }
}
