import CartSVG from '@/assets/car.svg';
import { Car } from '../../interfaces/api';

export default class CarTrack {
  private startButton?: HTMLDivElement;

  private stopButton?: HTMLDivElement;

  private trackMark?: HTMLDivElement;

  constructor(private carId: number) {}

  public startEngine(): Promise<{ velocity: number; distance: number }> {
    return new Promise((resolve, reject) => {
      fetch(`http://127.0.0.1:3000/engine?id=${this.carId}&status=started`)
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch(() => reject());
    });
  }

  public startDriving() {
    
  }

  public stopEngine() {}

  public renderCarTrack(parentCar: HTMLElement, carElem: Car) {
    const racePanel = document.createElement('div');
    racePanel.classList.add('garage__item-race');
    parentCar.appendChild(racePanel);

    this.startButton = document.createElement('div');
    this.startButton.classList.add('garage__item-start');
    this.startButton.textContent = 'A';
    racePanel.appendChild(this.startButton);

    this.stopButton = document.createElement('div');
    this.stopButton.classList.add('garage__item-stop');
    this.stopButton.textContent = 'B';
    racePanel.appendChild(this.stopButton);

    const track = document.createElement('div');
    track.classList.add('garage__item-track');
    track.innerHTML = CartSVG;
    racePanel.appendChild(track);

    const car = track.querySelector('svg path')!;
    car.setAttribute('fill', carElem.color);

    this.trackMark = document.createElement('div');
    this.trackMark.classList.add('garage__item-finish');
    track.appendChild(this.trackMark);
  }

  private attachEvents() {
    this.startButton?.addEventListener('click', () => {
      this.startEngine().then(() => this.startDriving());
    });
  }
}
