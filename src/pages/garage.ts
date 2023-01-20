import NestedComponent from '../components/nested-component';
import ControlPanel, { ControlPanelEvent } from '../components/garage/control-panel';
import { Car } from '../interfaces/api';
import CarTrack, { AnimationOptions, DrivingCar } from '../components/garage/car';

export default class GaragePage extends NestedComponent {
  private controlPanel?: ControlPanel;

  private garage?: HTMLDivElement;

  private cars: Car[] = [];

  private totalCars = 0;

  private cartTracks: CarTrack[] = [];

  private carsNumberHtml?: HTMLDivElement;

  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.controlPanel = new ControlPanel(parentNode);
  }

  public startRace(): Promise<DrivingCar> {
    const racingCars: Promise<DrivingCar>[] = [];

    this.cartTracks.forEach((carTrack) => {
      if (carTrack.isDriving) {
        return;
      }

      racingCars.push(carTrack.start());
    });

    return Promise.any(racingCars);
  }

  public stopRace() {
    this.cartTracks.forEach((carTrack) => {
      if (carTrack.isDriving && carTrack.isStopped) {
        carTrack.stopEngine();
        carTrack.stopAnimation(AnimationOptions.reset);
      }
    });
  }

  public addCar(car: Car) {
    this.totalCars += 1;
    this.renderCarsNumber();

    if (this.cars.length < 99) {
      this.cars.push(car);
      this.renderCar(car);
    }
  }

  public render() {
    if (!this.controlPanel) throw new Error();

    this.controlPanel.render();

    this.getCars().then(() => {
      this.renderCarsNumber();
      const currentPage = document.createElement('h1');
      currentPage.textContent = 'Page #1';
      currentPage.classList.add('curretn-page');
      this.parentNode.appendChild(currentPage);
      this.renderCars();
    });

    this.attachEvents();
  }

  private renderCarsNumber() {
    if (!this.carsNumberHtml) {
      this.carsNumberHtml = document.createElement('h1');
      this.carsNumberHtml.classList.add('numbers-of-cars');
      this.parentNode.appendChild(this.carsNumberHtml);
    }

    this.carsNumberHtml.textContent = `Garage(${this.totalCars})`;
  }

  private renderCars() {
    this.garage = document.createElement('div');
    this.garage.classList.add('garage');
    this.parentNode.appendChild(this.garage);

    this.cars?.forEach((elem) => {
      this.renderCar(elem);
    });
  }

  private renderCar(car: Car) {
    if (!this.garage) throw new Error();

    const carTrack = new CarTrack(car, this.garage);
    carTrack.render();
    this.cartTracks.push(carTrack);

    // carTrack.addEventListener(CarTrackEvent.SELECT_CAR, (selectedCar) => {});
  }

  private getCars() {
    return new Promise<void>((resolve, reject) => {
      fetch('http://127.0.0.1:3000/garage?_page=1&_limit=99')
        .then((response) => {
          this.totalCars = +(response.headers.get('X-Total-Count') || '0');
          return response.json();
        })
        .then((data) => {
          this.cars = data;
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  private createNewCar(data: { name: string; color: string }) {
    fetch('http://localhost:3000/garage', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((rdata) => this.addCar(rdata));
  }

  public deleteCar(car: Car, garageItem: HTMLDivElement) {
    fetch(`http://localhost:3000/garage/${car.id}`, {
      method: 'DELETE',
    });
    garageItem.remove();
  }

  private attachEvents() {
    if (!this.controlPanel) throw new Error();

    this.controlPanel.addEventListener(ControlPanelEvent.START_RACE, () => {
      this.startRace().then(({ theCar, drivingTime }) => {
        const winner = document.createElement('div');
        winner.classList.add('winner');
        winner.textContent = `Winner ${theCar.name}(${drivingTime} sec)`;
        document.body.appendChild(winner);
        setTimeout(() => {
          winner.remove();
        }, 3000);
      });
    });

    this.controlPanel.addEventListener(ControlPanelEvent.RESET, () => {
      this.stopRace();
    });

    this.controlPanel.addEventListener(ControlPanelEvent.CREATE, (name: string, color: string) => {
      this.createNewCar({ name, color });
    });
  }
}
