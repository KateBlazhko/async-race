import Router from './router';
import GarController from '../controller/garController';
import WinController from '../controller/winController';
import Control from '../common/control';
import GarageView from '../view/garage/garView';
import WinnersView from '../view/winners/winView';
import Header from '../view/header';
import Footer from '../view/footer';
import GarModel from '../state/garModel';
import WinModel from '../state/winModel';

export type Page =
  {
    hash: string,
    view: GarageView | WinnersView
  }

class App {
  private router: Router;

  private garage: GarageView;

  private winners: WinnersView;

  private currentPage: GarageView | WinnersView | null = null;

  private main: Control;

  public pages: Page[];

  constructor() {
    const garModel = new GarModel();
    const winModel = new WinModel();
    const garController = new GarController(garModel);
    const winController = new WinController(winModel, garModel);

    this.garage = new GarageView(null, 'garage', garModel, garController);
    this.winners = new WinnersView(null, 'winners', winModel, winController);

    this.pages = [
      { hash: 'garage', view: this.garage },
      { hash: 'winners', view: this.winners },
    ];

    this.router = new Router(this, this.pages);

    const header = new Header(document.body, 'header', this.pages);

    const container = new Control(document.body, 'div', 'container');
    this.main = new Control(container.node, 'main', 'app');
    const footer = new Footer(document.body, 'footer');

    this.createView();
  }

  start() {
    this.router.change();
  }

  public createView() {
    if (this.currentPage) this.currentPage.destroy();

    this.currentPage = this.router.getPage();

    this.main.node.appendChild(this.currentPage.node);
  }
}

export default App;
