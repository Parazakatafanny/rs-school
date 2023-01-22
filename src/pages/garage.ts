import NestedComponent from '../components/nested-component';
import ControlPanel, { ControlPanelEvent } from '../components/garage/control-panel';
import { Car, Winner } from '../interfaces/api';
import CarTrack, { AnimationOptions, CarTrackEvent, DrivingCar } from '../components/garage/car';
import { API_URL, CARS_ON_PAGE, CAR_BRAND, CAR_MODEL } from '../common/consts';

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

    carTrack.addEventListener(CarTrackEvent.REMOVE_CAR, (deletedCar) => {
      this.deleteCar(deletedCar.id);
      carTrack.delete();
    });

    carTrack.addEventListener(CarTrackEvent.SELECT_CAR, (selectedCar) => {
      this.controlPanel?.setCarForUpdate(selectedCar);
    });
  }

  private getCars() {
    return new Promise<void>((resolve, reject) => {
      fetch(`${API_URL}/garage?_page=1&_limit=${CARS_ON_PAGE}`)
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
    fetch(`${API_URL}/garage`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((rdata) => this.addCar(rdata));
  }

  private deleteCar(carId: number) {
    fetch(`${API_URL}/garage/${carId}`, {
      method: 'DELETE',
    });

    fetch(`${API_URL}/winners/${carId}`, {
      method: 'DELETE',
    });
  }

  private updateCar(car: Car) {
    fetch(`${API_URL}/garage/${car.id}`, {
      method: 'PUT',
      body: JSON.stringify(car),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private createOrUpdateWinner(winner: Winner) {
    fetch(`${API_URL}/winners`, {
      method: 'POST',
      body: JSON.stringify(winner),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.status !== 500) return;

      this.getWinner(winner.id).then(({ id, time, wins }) => {
        const newBestTime = time < winner.time ? time : winner.time;
        const newWinner = {
          id,
          wins: wins + 1,
          time: newBestTime,
        };
        this.updateWinner(newWinner);
      });
    });
  }

  private getWinner(winnerId: number) {
    return new Promise<Winner>((resolve, reject) => {
      fetch(`${API_URL}/winners/${winnerId}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => {
          reject();
        });
    });
  }

  private updateWinner(winner: Winner) {
    fetch(`${API_URL}/winners/${winner.id}`, {
      method: 'PUT',
      body: JSON.stringify({ time: winner.time, wins: winner.wins }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private attachEvents() {
    if (!this.controlPanel) throw new Error();

    this.controlPanel.addEventListener(ControlPanelEvent.START_RACE, () => {
      this.startRace().then(({ theCar, drivingTime }) => {
        this.createOrUpdateWinner({
          id: theCar.id,
          time: drivingTime,
          wins: 1,
        });
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

    this.controlPanel.addEventListener(ControlPanelEvent.UPDATE_CAR, (updatedCar: Car) => {
      this.cartTracks.forEach((carTrack) => {
        if (carTrack.car.id === updatedCar.id) {
          carTrack.update(updatedCar);
          this.updateCar(updatedCar);
        }
      });
    });

    this.controlPanel.addEventListener(ControlPanelEvent.GENERATE_NEW_CARS, (cars_num: number) => {
      this.renderCarsNumber();

      for (let i = 0; i < cars_num; i += 1) {
        const brand = CAR_BRAND[Math.floor(Math.random() * CAR_BRAND.length)];
        const model = CAR_MODEL[Math.floor(Math.random() * CAR_MODEL.length)];
        const color = Math.floor(Math.random() * 16777215).toString(16);

        this.createNewCar({
          name: `${brand} ${model}`,
          color: `#${color}`,
        });
      }
    });
  }
}
