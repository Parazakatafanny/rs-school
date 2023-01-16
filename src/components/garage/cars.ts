import { Car } from '../../interfaces/api';
import NestedComponent from '../nested-component';
import CarTrack from './car';

export default class Cars extends NestedComponent {
  public cars?: Car[];

  public totalCars = 0;

  public render() {
    this.renderNumberOfCars();
  }

  public renderNumberOfCars() {
    const numbersOfCars = document.createElement('h1');
    numbersOfCars.classList.add('numbers-of-cars');
    this.getCars().then(() => {
      numbersOfCars.textContent = `Garage(${this.totalCars})`;
      this.parentNode.appendChild(numbersOfCars);

      const currentPage = document.createElement('h1');
      currentPage.textContent = 'Page #1';
      currentPage.classList.add('curretn-page');
      this.parentNode.appendChild(currentPage);
      this.renderCars();
    });
  }

  private renderCars() {
    const garage = document.createElement('div');
    garage.classList.add('garage');
    this.parentNode.appendChild(garage);

    this.cars?.forEach((elem) => {
      const garageItem = document.createElement('div');
      garageItem.classList.add('garage__item');
      garage.appendChild(garageItem);

      const itemControlPanel = document.createElement('div');
      itemControlPanel.classList.add('garage__item-panel');
      garageItem.appendChild(itemControlPanel);

      const selectButton = document.createElement('button');
      selectButton.classList.add('garage__item-select');
      selectButton.textContent = 'select';
      itemControlPanel.appendChild(selectButton);

      const removeButton = document.createElement('button');
      removeButton.classList.add('garage__item-remove');
      removeButton.textContent = 'remove';
      itemControlPanel.appendChild(removeButton);

      const itemName = document.createElement('p');
      itemName.classList.add('garage__item-name');
      itemName.textContent = elem.name;
      itemControlPanel.appendChild(itemName);
      const carTrack = new CarTrack(elem.id);
      carTrack.renderCarTrack(garageItem, elem);
    });
  }

  private getCars() {
    return new Promise<void>((resolve, reject) => {
      fetch('http://127.0.0.1:3000/garage?_page=1&_limit=7')
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
}
