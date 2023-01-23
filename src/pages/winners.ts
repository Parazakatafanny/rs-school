import { WinnerComponent, WinnerData } from '../components/winners/winner';
import NestedComponent from '../components/nested-component';
import { Car, Winner } from '../interfaces/api';
import { API_URL, WINNERS_ON_PAGE } from '../common/consts';
import constructURL from '../common/utils';

enum SortField {
  byWins = 'wins',
  byTime = 'time',
}

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export default class WinnersPage extends NestedComponent {
  private totalWinners = 0;

  private tableWinners?: HTMLElement;

  private bestTimes?: HTMLElement;

  private winnerWins?: HTMLElement;

  private winners?: Winner[];

  private currentPage: number;

  private nextPage?: HTMLButtonElement;

  private prevPage?: HTMLButtonElement;

  private winnersHtml?: HTMLElement;

  private sort: { field: SortField; order: SortOrder } = {
    field: SortField.byTime,
    order: SortOrder.ASC,
  };

  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.currentPage = +(localStorage.getItem('currentWinnersPage') || 1);
  }

  public hide() {
    if (!this.winnersHtml) return;
    this.winnersHtml.style.display = 'none';
  }

  public show() {
    this.render();
  }

  public render() {
    this.winnersHtml?.remove();
    this.winnersHtml = document.createElement('div');
    this.parentNode.append(this.winnersHtml);

    this.getWinners().then(() => {
      if (!this.winnersHtml) throw new Error();

      const numberWinners = document.createElement('div');
      numberWinners.classList.add('number-winners');
      numberWinners.textContent = `Winners (${this.totalWinners})`;
      this.winnersHtml.appendChild(numberWinners);

      this.renderPageNumber();

      this.tableWinners = document.createElement('div');
      this.tableWinners.classList.add('table-winners');
      this.winnersHtml.appendChild(this.tableWinners);

      this.renderWinners();

      const pagePanel = document.createElement('div');
      pagePanel.classList.add('page-panel');
      this.winnersHtml.appendChild(pagePanel);

      this.prevPage = document.createElement('button');
      this.prevPage.classList.add('prev-page');
      this.prevPage.innerHTML = 'prev';
      pagePanel.appendChild(this.prevPage);

      this.nextPage = document.createElement('button');
      this.nextPage.classList.add('next-page');
      this.nextPage.innerHTML = 'next';
      pagePanel.appendChild(this.nextPage);
      this.attachEvents();
    });
  }

  private renderPageNumber() {
    const currentPage = document.createElement('h1');
    currentPage.textContent = `Page #${this.currentPage}`;
    currentPage.classList.add('curretn-page');
    this.winnersHtml?.appendChild(currentPage);
  }

  private renderWinners() {
    if (!this.tableWinners) throw new Error();
    this.tableWinners.innerHTML = '';

    this.createSortPanel();

    this.winners?.forEach((winner, idx) => {
      this.getCar(winner.id).then((data) => {
        if (!this.tableWinners) throw new Error();

        const offset = WINNERS_ON_PAGE * (this.currentPage - 1);
        const winnerData: WinnerData = {
          idx: offset + idx + 1,
          color: data.color,
          name: data.name,
          wins: winner.wins,
          bestTime: winner.time,
        };
        const winnerComponent = new WinnerComponent(this.tableWinners, winnerData);
        winnerComponent.render();
      });
    });
  }

  private createSortPanel() {
    if (!this.tableWinners) throw new Error();

    const sortPanel = document.createElement('div');
    sortPanel.classList.add('sort-panel');
    this.tableWinners.appendChild(sortPanel);

    const winnerNumbers = document.createElement('div');
    winnerNumbers.classList.add('number');
    winnerNumbers.textContent = 'Number';
    sortPanel.appendChild(winnerNumbers);

    const car = document.createElement('div');
    car.classList.add('car');
    car.textContent = 'Car';
    sortPanel.appendChild(car);

    const winnerNames = document.createElement('div');
    winnerNames.classList.add('name');
    winnerNames.textContent = 'Name';
    sortPanel.appendChild(winnerNames);

    this.winnerWins = document.createElement('div');
    this.winnerWins.classList.add('wins');
    this.winnerWins.textContent = 'Wins';
    sortPanel.appendChild(this.winnerWins);

    this.bestTimes = document.createElement('div');
    this.bestTimes.classList.add('best-time');
    this.bestTimes.textContent = 'Best time (seconds)';
    sortPanel.appendChild(this.bestTimes);
  }

  private getWinners() {
    return new Promise<void>((resolve, reject) => {
      const url = constructURL(`${API_URL}/winners`, {
        _page: this.currentPage,
        _limit: WINNERS_ON_PAGE,
        _sort: this.sort.field,
        _order: this.sort.order,
      });

      console.log();

      fetch(url)
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
      fetch(`${API_URL}/garage/${carId}`)
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch(() => {
          reject();
        });
    });
  }

  private get maxPages() {
    return Math.ceil(this.totalWinners / WINNERS_ON_PAGE);
  }

  private attachEvents() {
    if (!this.nextPage) throw new Error();
    if (!this.prevPage) throw new Error();
    if (!this.winnerWins) throw new Error();
    if (!this.bestTimes) throw new Error();

    this.winnerWins.addEventListener('click', () => {
      this.sort = {
        field: SortField.byWins,
        order: this.sort.order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      };

      this.render();
    });

    this.bestTimes.addEventListener('click', () => {
      this.sort = {
        field: SortField.byTime,
        order: this.sort.order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      };

      this.render();
    });

    this.nextPage.addEventListener('click', () => {
      if (this.currentPage === this.maxPages) {
        return;
      }
      this.currentPage += 1;
      localStorage.setItem('currentWinnersPage', `${this.currentPage}`);
      this.render();
    });

    this.prevPage.addEventListener('click', () => {
      const firstPage = 1;
      if (this.currentPage === firstPage) {
        return;
      }
      this.currentPage -= 1;
      localStorage.setItem('currentWinnersPage', `${this.currentPage}`);
      this.render();
    });
  }
}
