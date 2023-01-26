import NestedComponent from '../components/nested-component';
import ControlPanel, { ControlPanelEvent } from '../components/garage/control-panel';
import { Car, Winner } from '../interfaces/api';
import CarTrack, { CarTrackEvent, DrivingCar } from '../components/garage/car';
import { API_URL, CARS_ON_PAGE, CAR_BRAND, CAR_MODEL } from '../common/consts';

export default class GaragePage extends NestedComponent {
  private controlPanel?: ControlPanel;

  private garage?: HTMLDivElement;

  private garageInner?: HTMLDivElement;

  private cars: Car[] = [];

  private totalCars = 0;

  private cartTracks: CarTrack[] = [];

  private carsNumberHtml?: HTMLDivElement;

  private nextPage?: HTMLButtonElement;

  private prevPage?: HTMLButtonElement;

  private currentPage: number;

  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.currentPage = +(localStorage.getItem('currentGaragePage') || 1);
  }

  public hide() {
    if (!this.garage) return;
    this.garage.style.display = 'none';
  }

  public show() {
    if (!this.garage) {
      this.render();
    } else {
      this.garage.style.display = 'block';
    }
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
      carTrack.stop();
    });
  }

  public addCar(car: Car) {
    this.totalCars += 1;
    this.renderCarsNumber();

    if (this.cars.length < 7) {
      this.cars.push(car);
      this.renderCar(car);
    }
  }

  public render() {
    this.garage = document.createElement('div');
    this.garage.classList.add('garage-page');
    this.parentNode.appendChild(this.garage);

    this.controlPanel = new ControlPanel(this.garage);
    this.controlPanel.render();

    this.garageInner = document.createElement('div');
    this.garageInner.classList.add('garage');
    this.garage?.appendChild(this.garageInner);

    this.renderGarage();
    this.createPagePanel();
    this.attachEvents();
  }

  private renderGarage() {
    this.carsNumberHtml = undefined;

    this.getCars(this.currentPage).then(() => {
      if (!this.garageInner) throw new Error();

      this.garageInner.innerHTML = '';

      this.renderCarsNumber();
      this.renderCurrentPage();

      this.renderCars();
    });
  }

  private renderCurrentPage() {
    if (!this.garageInner) throw new Error();

    const currentPage = document.createElement('h1');
    currentPage.textContent = `Page #${this.currentPage}`;
    currentPage.classList.add('curretn-page');
    this.garageInner.appendChild(currentPage);
  }

  private renderCarsNumber() {
    if (!this.garageInner) throw new Error();
    if (!this.carsNumberHtml) {
      this.carsNumberHtml = document.createElement('h1');
      this.carsNumberHtml.classList.add('numbers-of-cars');
      this.garageInner.appendChild(this.carsNumberHtml);
    }

    this.carsNumberHtml.textContent = `Garage(${this.totalCars})`;
  }

  private createPagePanel() {
    if (!this.garage) throw new Error();

    if (this.nextPage || this.prevPage) {
      return;
    }

    const pagePanel = document.createElement('div');
    pagePanel.classList.add('page-panel');
    this.garage.appendChild(pagePanel);

    this.prevPage = document.createElement('button');
    this.prevPage.classList.add('prev-page');
    this.prevPage.innerHTML = 'prev';
    pagePanel.appendChild(this.prevPage);

    this.nextPage = document.createElement('button');
    this.nextPage.classList.add('next-page');
    this.nextPage.innerHTML = 'next';
    pagePanel.appendChild(this.nextPage);
  }

  private renderCars() {
    this.cars?.forEach((elem) => {
      this.renderCar(elem);
    });
  }

  private renderCar(car: Car) {
    if (!this.garageInner) throw new Error();

    const carTrack = new CarTrack(car, this.garageInner);
    carTrack.render();
    this.cartTracks.push(carTrack);

    carTrack.addEventListener(CarTrackEvent.REMOVE_CAR, (deletedCar) => {
      this.deleteCar(deletedCar.id);
    });

    carTrack.addEventListener(CarTrackEvent.SELECT_CAR, (selectedCar) => {
      this.controlPanel?.setCarForUpdate(selectedCar);
    });
  }

  private getCars(page: number) {
    return new Promise<void>((resolve, reject) => {
      fetch(`${API_URL}/garage?_page=${page}&_limit=${CARS_ON_PAGE}`)
        .then((response) => {
          this.totalCars = +(response.headers.get('X-Total-Count') || '0');
          return response.json();
        })
        .then((data) => {
          this.cartTracks = [];
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
    }).then(() => {
      this.renderGarage();
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

  private get maxPages() {
    return Math.ceil(this.totalCars / CARS_ON_PAGE);
  }

  private attachEvents() {
    if (!this.controlPanel) throw new Error();
    if (!this.nextPage) throw new Error();
    if (!this.prevPage) throw new Error();

    this.nextPage.addEventListener('click', () => {
      if (this.currentPage === this.maxPages) {
        return;
      }
      this.currentPage += 1;
      localStorage.setItem('currentGaragePage', `${this.currentPage}`);
      this.renderGarage();
    });

    this.prevPage.addEventListener('click', () => {
      const firstPage = 1;
      if (this.currentPage === firstPage) {
        return;
      }
      this.currentPage -= 1;
      localStorage.setItem('currentGaragePage', `${this.currentPage}`);
      this.renderGarage();
    });

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
