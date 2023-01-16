import NestedComponent from '../nested-component';

export default class ControlPanel extends NestedComponent {
  public render() {
    const controlPanel = document.createElement('div');
    controlPanel.classList.add('control-panel');
    this.parentNode.appendChild(controlPanel);

    this.renderCreatePanel(controlPanel);
    this.renderUpdatePanel(controlPanel);
    this.renderButtonsPanel(controlPanel);
  }

  private renderCreatePanel(controlPanel: HTMLElement) {
    const createPanel = document.createElement('div');
    createPanel.classList.add('create-panel');
    controlPanel.appendChild(createPanel);

    const inputCreate = document.createElement('input');
    inputCreate.classList.add('create-panel__create-input');
    inputCreate.type = 'text';
    createPanel.appendChild(inputCreate);

    const inputCreateColor = document.createElement('input');
    inputCreateColor.classList.add('create-panel__create-color');
    inputCreateColor.type = 'color';
    createPanel.appendChild(inputCreateColor);

    const createButton = document.createElement('button');
    createButton.classList.add('create-panel__create');
    createButton.textContent = 'create';
    createPanel.appendChild(createButton);
  }

  private renderUpdatePanel(controlPanel: HTMLElement) {
    const updatePanel = document.createElement('div');
    updatePanel.classList.add('update-panel');
    controlPanel.appendChild(updatePanel);

    const inputUpdate = document.createElement('input');
    inputUpdate.classList.add('update-panel__update-input');
    inputUpdate.type = 'text';
    updatePanel.appendChild(inputUpdate);

    const inputUpdateColor = document.createElement('input');
    inputUpdateColor.classList.add('update-panel__update-color');
    inputUpdateColor.type = 'color';
    updatePanel.appendChild(inputUpdateColor);

    const updateButton = document.createElement('button');
    updateButton.classList.add('update-panel__update');
    updateButton.textContent = 'update';
    updatePanel.appendChild(updateButton);
  }

  private renderButtonsPanel(controlPanel: HTMLElement) {
    const buttonPanel = document.createElement('div');
    buttonPanel.classList.add('button-panel');
    controlPanel.appendChild(buttonPanel);

    const raceButton = document.createElement('button');
    raceButton.classList.add('button-panel__race');
    raceButton.textContent = 'race';
    buttonPanel.appendChild(raceButton);

    const resetButton = document.createElement('button');
    resetButton.classList.add('button-panel__reset');
    resetButton.textContent = 'reset';
    buttonPanel.appendChild(resetButton);

    const generateCarsButton = document.createElement('button');
    generateCarsButton.classList.add('button-panel__generate-cars');
    generateCarsButton.textContent = 'generate cars';
    buttonPanel.appendChild(generateCarsButton);
  }
}
