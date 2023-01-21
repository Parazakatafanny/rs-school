import { WinnerComponent, WinnerData } from '../components/winners/winner';
import NestedComponent from '../components/nested-component';
import { Car, Winner } from '../interfaces/api';

export default class WinnersPage extends NestedComponent {
  private totalWinners = 0;

  private tableWinners?: HTMLElement;

  private winners?: Winner[];

  public render() {
    const allWinners = document.createElement('div');
    allWinners.classList.add('all-winners');
    this.parentNode.appendChild(allWinners);

    this.getWinners().then(() => {
      const numberWinners = document.createElement('div');
      numberWinners.classList.add('number-winners');
      numberWinners.textContent = `Winners (${this.totalWinners})`;
      allWinners.appendChild(numberWinners);

      const currentPage = document.createElement('h1');
      currentPage.textContent = 'Page #1';
      currentPage.classList.add('curretn-page');
      allWinners.appendChild(currentPage);

      this.tableWinners = document.createElement('div');
      this.tableWinners.classList.add('table-winners');
      allWinners.appendChild(this.tableWinners);
      this.createSortPanel();

      this.winners?.forEach((winner, idx) => {
        this.getCar(winner.id).then((data) => {
          if (!this.tableWinners) throw new Error();

          const winnerData: WinnerData = {
            idx: idx + 1,
            color: data.color,
            name: data.name,
            wins: winner.wins,
            bestTime: winner.time,
          };
          const winnerComponent = new WinnerComponent(this.tableWinners, winnerData);
          winnerComponent.render();
        });
      });
    });
  }

  private createSortPanel() {
    if (!this.tableWinners) throw new Error();

    const sortPanel = document.createElement('div');
    sortPanel.classList.add('sort-panel');
    this.tableWinners.appendChild(sortPanel);

    const number = document.createElement('div');
    number.classList.add('number');
    number.textContent = 'Number';
    sortPanel.appendChild(number);

    const car = document.createElement('div');
    car.classList.add('car');
    car.textContent = 'Car';
    sortPanel.appendChild(car);

    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = 'Name';
    sortPanel.appendChild(name);

    const wins = document.createElement('div');
    wins.classList.add('wins');
    wins.textContent = 'Wins';
    sortPanel.appendChild(wins);

    const bestTime = document.createElement('div');
    bestTime.classList.add('best-time');
    bestTime.textContent = 'Best time (seconds)';
    sortPanel.appendChild(bestTime);
  }

  private getWinners() {
    return new Promise<void>((resolve, reject) => {
      fetch('http://127.0.0.1:3000/winners?_page=1&_limit=7&_sort=id&_order=ASC')
        .then((response) => {
          this.totalWinners = +(response.headers.get('X-Total-Count') || '0');
          return response.json();
        })
        .then((data) => {
          this.winners = data;
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  private getCar(carId: number) {
    return new Promise<Car>((resolve, reject) => {
      fetch(`http://127.0.0.1:3000/garage/${carId}`)
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => {
          reject();
        });
    });
  }
}
