import CartSVG from '@/assets/car.svg';
import { API_URL } from '../../common/consts';
import { Car } from '../../interfaces/api';
import NestedComponent from '../nested-component';

type EngineData = { velocity: number; distance: number };

export type DrivingCar = { theCar: Car; drivingTime: number };

export enum AnimationOptions {
  stoped = 'stoped',
  reset = 'reset',
}

export enum CarTrackEvent {
  SELECT_CAR,
  REMOVE_CAR,
}

type CarTracklEventFunction = {
  [CarTrackEvent.REMOVE_CAR]: (car: Car) => void;
  [CarTrackEvent.SELECT_CAR]: (car: Car) => void;
};

type SubsType = { [K in keyof CarTracklEventFunction]: CarTracklEventFunction[K][] };

export default class CarTrack extends NestedComponent {
  private startButton?: HTMLDivElement;

  private stopButton?: HTMLDivElement;

  private selectButton?: HTMLButtonElement;

  private removeButton?: HTMLButtonElement;

  private garageItem?: HTMLDivElement;

  private trackMark?: HTMLDivElement;

  private carElem?: SVGSVGElement;

  private carName?: HTMLElement;

  private abortController: AbortController;

  public isDriving = false;

  public isStopped = false;

  private subscriptions: SubsType = {
    [CarTrackEvent.SELECT_CAR]: [],
    [CarTrackEvent.REMOVE_CAR]: [],
  };

  constructor(public car: Car, parentNode: HTMLElement) {
    super(parentNode);
    this.abortController = new AbortController();
  }

  public addEventListener<T extends CarTrackEvent>(event: T, fn: CarTracklEventFunction[T]) {
    this.subscriptions[event].push(fn);
  }

  /*eslint-disable */
    private notify<T extends CarTrackEvent>(event: T, ...args: Parameters<CarTracklEventFunction[T]>) {
      this.subscriptions[event].forEach((fn) => {
        // @ts-ignore
        fn(...args);
      });
    }
    /* eslint-enable */

  public render() {
    this.garageItem = document.createElement('div');
    this.garageItem.classList.add('garage__item');
    this.parentNode.appendChild(this.garageItem);

    const itemControlPanel = document.createElement('div');
    itemControlPanel.classList.add('garage__item-panel');
    this.garageItem.appendChild(itemControlPanel);

    this.selectButton = document.createElement('button');
    this.selectButton.classList.add('garage__item-select');
    this.selectButton.textContent = 'select';
    itemControlPanel.appendChild(this.selectButton);

    this.removeButton = document.createElement('button');
    this.removeButton.classList.add('garage__item-remove');
    this.removeButton.textContent = 'remove';
    itemControlPanel.appendChild(this.removeButton);

    this.carName = document.createElement('p');
    this.carName.classList.add('garage__item-name');
    this.carName.textContent = this.car.name;
    itemControlPanel.appendChild(this.carName);

    this.renderCarTrack(this.garageItem);
    this.attachEvents();
  }

  public delete() {
    this.garageItem?.remove();
  }

  public update(car: Car) {
    if (!this.carElem) throw new Error();
    if (!this.carName) throw new Error();

    this.car = car;
    this.carName.textContent = car.name;
    this.carElem.style.fill = car.color;
  }

  public startEngine(): Promise<EngineData> {
    this.isDriving = true;
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/engine?id=${this.car.id}&status=started`, {
        method: 'PATCH',
        signal: this.abortController.signal,
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => reject());
    });
  }

  public start(): Promise<DrivingCar> {
    const startTimer = new Date().getTime();
    return new Promise((resolve, reject) => {
      this.startEngine()
        .then((data) => this.startDriving(data))
        .then(() => {
          const stopTimer = new Date().getTime();
          resolve({ theCar: this.car, drivingTime: (stopTimer - startTimer) / 1000 });
        })
        .catch(() => reject());
    });
  }

  public stop() {
    if (!this.isDriving) {
      return;
    }

    this.abortController.abort();

    this.stopEngine();
    this.stopAnimation(AnimationOptions.reset);

    this.abortController = new AbortController();
  }

  public startDriving(engineData: EngineData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.carElem) throw new Error();
      if (!this.trackMark) throw new Error();
      this.isStopped = true;

      const speed = engineData.distance / engineData.velocity / 1000;

      this.carElem.style.transition = `padding-left ${speed}s linear`;
      this.carElem.style.paddingLeft = 'calc(100% - 105px)';

      fetch(`${API_URL}/engine?id=${this.car.id}&status=drive`, {
        method: 'PATCH',
        signal: this.abortController.signal,
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch(() => {
          this.stopAnimation(AnimationOptions.stoped);
          reject();
        });
    });
  }

  public stopAnimation(options: AnimationOptions) {
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
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/engine?id=${this.car.id}&status=stopped`, {
        method: 'PATCH',
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => reject());
    });
  }

  public renderCarTrack(parentCar: HTMLElement) {
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
    this.carElem.setAttribute('fill', this.car.color);

    this.trackMark = document.createElement('div');
    this.trackMark.classList.add('garage__item-finish');
    track.appendChild(this.trackMark);
  }

  private attachEvents() {
    this.startButton?.addEventListener('click', () => {
      if (!this.isDriving) {
        this.startEngine().then((data) => this.startDriving(data));
      }
    });

    this.stopButton?.addEventListener('click', () => {
      if (this.isDriving && this.isStopped) {
        this.stopEngine();
        this.stopAnimation(AnimationOptions.reset);
      }
    });

    this.removeButton?.addEventListener('click', () => {
      this.notify(CarTrackEvent.REMOVE_CAR, this.car);
    });

    this.selectButton?.addEventListener('click', () => {
      this.notify(CarTrackEvent.SELECT_CAR, this.car);
    });
  }
}
