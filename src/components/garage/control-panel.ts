import { Car } from '../../interfaces/api';
import NestedComponent from '../nested-component';

export enum ControlPanelEvent {
  START_RACE,
  RESET,
  GENERATE_NEW_CARS,
  CREATE,
  UPDATE_CAR,
}

const GENERATE_CARS_NUM = 100;

type EmptyFn = () => void;

type ControlPanelEventFunction = {
  [ControlPanelEvent.RESET]: EmptyFn;
  [ControlPanelEvent.GENERATE_NEW_CARS]: (cars_num: number) => void;
  [ControlPanelEvent.CREATE]: (name: string, color: string) => void;
  [ControlPanelEvent.START_RACE]: EmptyFn;
  [ControlPanelEvent.UPDATE_CAR]: (car: Car) => void;
};

type SubsType = { [K in keyof ControlPanelEventFunction]: ControlPanelEventFunction[K][] };

export default class ControlPanel extends NestedComponent {
  private raceButton?: HTMLButtonElement;

  private resetButton?: HTMLButtonElement;

  private generateCarsButton?: HTMLButtonElement;

  private inputCreate?: HTMLInputElement;

  private inputCreateColor?: HTMLInputElement;

  private inputUpdate?: HTMLInputElement;

  private inputUpdateColor?: HTMLInputElement;

  private createButton?: HTMLButtonElement;

  private updateButton?: HTMLButtonElement;

  private carForUpdate?: Car;

  private subscriptions: SubsType = {
    [ControlPanelEvent.START_RACE]: [],
    [ControlPanelEvent.RESET]: [],
    [ControlPanelEvent.GENERATE_NEW_CARS]: [],
    [ControlPanelEvent.CREATE]: [],
    [ControlPanelEvent.UPDATE_CAR]: [],
  };

  public render() {
    const controlPanel = document.createElement('div');
    controlPanel.classList.add('control-panel');
    this.parentNode.appendChild(controlPanel);

    this.renderCreatePanel(controlPanel);
    this.renderUpdatePanel(controlPanel);
    this.renderButtonsPanel(controlPanel);

    this.attachEvents();
  }

  public addEventListener<T extends ControlPanelEvent>(event: T, fn: ControlPanelEventFunction[T]) {
    this.subscriptions[event].push(fn);
  }

  /*eslint-disable */
  private notify<T extends ControlPanelEvent>(event: T, ...args: Parameters<ControlPanelEventFunction[T]>) {
    this.subscriptions[event].forEach((fn) => {
      // @ts-ignore
      fn(...args);
    });
  }
  /* eslint-enable */

  public setCarForUpdate(car: Car) {
    if (!this.inputUpdate) throw new Error();
    if (!this.inputUpdateColor) throw new Error();

    this.carForUpdate = car;
    this.inputUpdate.value = car.name;
    this.inputUpdateColor.value = car.color;
  }

  private renderCreatePanel(controlPanel: HTMLElement) {
    const createPanel = document.createElement('div');
    createPanel.classList.add('create-panel');
    controlPanel.appendChild(createPanel);

    this.inputCreate = document.createElement('input');
    this.inputCreate.classList.add('create-panel__create-input');
    this.inputCreate.type = 'text';
    createPanel.appendChild(this.inputCreate);

    this.inputCreateColor = document.createElement('input');
    this.inputCreateColor.classList.add('create-panel__create-color');
    this.inputCreateColor.type = 'color';
    createPanel.appendChild(this.inputCreateColor);

    this.createButton = document.createElement('button');
    this.createButton.classList.add('create-panel__create');
    this.createButton.textContent = 'create';
    createPanel.appendChild(this.createButton);
  }

  private renderUpdatePanel(controlPanel: HTMLElement) {
    const updatePanel = document.createElement('div');
    updatePanel.classList.add('update-panel');
    controlPanel.appendChild(updatePanel);

    this.inputUpdate = document.createElement('input');
    this.inputUpdate.classList.add('update-panel__update-input');
    this.inputUpdate.type = 'text';
    updatePanel.appendChild(this.inputUpdate);

    this.inputUpdateColor = document.createElement('input');
    this.inputUpdateColor.classList.add('update-panel__update-color');
    this.inputUpdateColor.type = 'color';
    updatePanel.appendChild(this.inputUpdateColor);

    this.updateButton = document.createElement('button');
    this.updateButton.classList.add('update-panel__update');
    this.updateButton.textContent = 'update';
    updatePanel.appendChild(this.updateButton);
  }

  private renderButtonsPanel(controlPanel: HTMLElement) {
    const buttonPanel = document.createElement('div');
    buttonPanel.classList.add('button-panel');
    controlPanel.appendChild(buttonPanel);

    this.raceButton = document.createElement('button');
    this.raceButton.classList.add('button-panel__race');
    this.raceButton.textContent = 'race';
    buttonPanel.appendChild(this.raceButton);

    this.resetButton = document.createElement('button');
    this.resetButton.classList.add('button-panel__reset');
    this.resetButton.textContent = 'reset';
    buttonPanel.appendChild(this.resetButton);

    this.generateCarsButton = document.createElement('button');
    this.generateCarsButton.classList.add('button-panel__generate-cars');
    this.generateCarsButton.textContent = 'generate cars';
    buttonPanel.appendChild(this.generateCarsButton);
  }

  private attachEvents() {
    this.raceButton?.addEventListener('click', () => {
      this.notify(ControlPanelEvent.START_RACE);
    });

    this.resetButton?.addEventListener('click', () => {
      this.notify(ControlPanelEvent.RESET);
    });

    this.createButton?.addEventListener('click', () => {
      if (!this.inputCreate) throw Error();
      if (!this.inputCreateColor) throw Error();
      if (this.inputCreate.value === '') {
        /*eslint-disable */
        alert('Please fill the car name field');
        /* eslint-enable */
        return;
      }

      this.notify(ControlPanelEvent.CREATE, this.inputCreate.value, this.inputCreateColor.value);
    });

    this.updateButton?.addEventListener('click', () => {
      if (!this.carForUpdate) {
        /*eslint-disable */
        alert('Please select a car first!');
        /* eslint-enable */
        return;
      }

      if (!this.inputUpdate) throw Error();
      if (!this.inputUpdateColor) throw Error();

      this.notify(ControlPanelEvent.UPDATE_CAR, {
        id: this.carForUpdate.id,
        name: this.inputUpdate.value,
        color: this.inputUpdateColor.value,
      });
    });

    this.generateCarsButton?.addEventListener('click', () => {
      this.notify(ControlPanelEvent.GENERATE_NEW_CARS, GENERATE_CARS_NUM);
    });
  }
}
