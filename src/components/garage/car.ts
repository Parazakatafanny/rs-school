import CartSVG from '@/assets/car.svg';
import { Car } from '../../interfaces/api';

type EngineData = { velocity: number; distance: number };

enum AnimationOptions {
  stoped = 'stoped',
  reset = 'reset',
}

export default class CarTrack {
  private startButton?: HTMLDivElement;

  private stopButton?: HTMLDivElement;

  private trackMark?: HTMLDivElement;

  private carElem?: SVGSVGElement;

  private isDriving = false;

  private isStopped = false;

  constructor(private carId: number) {}

  public startEngine(): Promise<EngineData> {
    return new Promise((resolve, reject) => {
      fetch(`http://127.0.0.1:3000/engine?id=${this.carId}&status=started`, {
        method: 'PATCH',
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => reject());
    });
  }

  public startDriving(engineData: EngineData) {
    return new Promise((resolve, reject) => {
      if (!this.carElem) throw new Error();
      if (!this.trackMark) throw new Error();
      this.isStopped = true;

      const speed = engineData.distance / engineData.velocity / 1000;

      this.carElem.style.transition = `padding-left ${speed}s linear`;
      this.carElem.style.paddingLeft = 'calc(100% - 105px)';

      fetch(`http://127.0.0.1:3000/engine?id=${this.carId}&status=drive`, {
        method: 'PATCH',
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch(() => {
          this.stopAnimation(AnimationOptions.stoped);
          reject();
        });
    });
  }

  private stopAnimation(options: AnimationOptions) {
    if (!this.carElem) throw new Error();

    let paddingLeft = '0';

    if (options === AnimationOptions.stoped) {
      const carStyles = window.getComputedStyle(this.carElem);
      paddingLeft = carStyles.getPropertyValue('padding-left');
    } else {
      this.carElem.style.transition = `padding-left ${0}s linear`;
    }

    this.carElem.style.paddingLeft = paddingLeft;
  }

  public stopEngine() {
    this.isDriving = false;
    console.log(this.isStopped);
    return new Promise((resolve, reject) => {
      fetch(`http://127.0.0.1:3000/engine?id=${this.carId}&status=stopped`, {
        method: 'PATCH',
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => reject());
    });
  }

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

    this.carElem = track.querySelector('svg')!;
    this.carElem.setAttribute('fill', carElem.color);

    this.trackMark = document.createElement('div');
    this.trackMark.classList.add('garage__item-finish');
    track.appendChild(this.trackMark);
    this.attachEvents();
  }

  private attachEvents() {
    this.startButton?.addEventListener('click', () => {
      if (!this.isDriving) {
        this.isDriving = true;
        this.startEngine().then((data) => this.startDriving(data));
      }
    });

    this.stopButton?.addEventListener('click', () => {
      if (this.isDriving && this.isStopped) {
        this.stopEngine();
        this.stopAnimation(AnimationOptions.reset);
      }
    });
  }
}
