import Cars from '../components/garage/cars';
import ControlPanel from '../components/garage/control-panel';

export default class GaragePage extends ControlPanel {
  private controlPanel?: ControlPanel;

  private cars?: Cars;

  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.controlPanel = new ControlPanel(parentNode);
    this.cars = new Cars(parentNode);
  }

  public render() {
    if (!this.controlPanel) throw new Error();
    if (!this.cars) throw new Error();
    this.controlPanel.render();
    this.cars.render();
  }
}
