import GaragePage from '../pages/garage';
import LogoSVG from '@/assets/rs-school-js.svg';

export default class NavigationComponent {
  public garageLink?: HTMLElement;

  public winnersLink?: HTMLElement;

  public viewportContainer?: HTMLDivElement;

  public init() {
    this.render();
    this.attachListeners();
    this.renderPage();
  }

  private render() {
    this.renderNavigationButtons();

    this.viewportContainer = document.createElement('div');
    this.viewportContainer.classList.add('app');
    document.body.appendChild(this.viewportContainer);

    this.renderFooter();
  }

  private renderNavigationButtons() {
    const header = document.createElement('div');
    header.classList.add('header');
    document.body.appendChild(header);

    this.garageLink = document.createElement('div');
    this.garageLink.classList.add('header__garage');
    this.garageLink.textContent = 'garage';
    header.appendChild(this.garageLink);

    this.winnersLink = document.createElement('div');
    this.winnersLink.classList.add('header__winners');
    this.winnersLink.textContent = 'winners';
    header.appendChild(this.winnersLink);
  }

  private renderFooter() {
    const footer = document.createElement('div');
    footer.classList.add('footer');
    document.body.appendChild(footer);

    const footerLogo = document.createElement('div');
    footerLogo.innerHTML = LogoSVG;
    footerLogo.classList.add('footer__logo');
    footer.appendChild(footerLogo);

    const footerYear = document.createElement('div');
    footerYear.textContent = '2023';
    footerYear.classList.add('footer__year');
    footer.appendChild(footerYear);

    const footerGitHub = document.createElement('a');
    footerGitHub.href = 'https://github.com/Parazakatafanny';
    footerGitHub.textContent = 'GitHub';
    footerGitHub.classList.add('footer__github');
    footer.appendChild(footerGitHub);
  }

  private attachListeners() {
    // this.garageLink?.addEventListener('click', () => {});
    // this.winnersLink?.addEventListener('click', () => {});
  }

  private get selectedPage() {
    return 'garage';
  }

  private renderPage() {
    if (!this.viewportContainer) throw new Error();
    this.viewportContainer.innerHTML = '';

    let page;

    if (this.selectedPage === 'garage') {
      page = new GaragePage(this.viewportContainer);
    } else {
      throw new Error();
    }

    page.render();
  }
}
