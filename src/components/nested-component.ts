export default abstract class NestedComponent {
  constructor(protected parentNode: HTMLElement) {}

  public abstract render(): void;
}
