import Router from './router';
import AppController from '../controller/appController';
import AppState from '../state/appState'
import Control from '../common/control';
import GarageView from '../view/garage/garageView'
import WinnersView from '../view/winners/winnersView';
import Header from '../view/header';
import Footer from '../view/footer';

export type Page =
  {
    hash: string,
    view: GarageView | WinnersView
  }

class App {
  private router: Router;
  private state: AppState;
  private controller: AppController;
  private garage: GarageView;
  private winners: WinnersView;
  private currentPage: GarageView | WinnersView;
  private main: Control;
  public pages: Page[]

  constructor() {
    this.state = new AppState();
    this.controller = new AppController(this.state);
    this.router = new Router(this);

    this.garage= new GarageView(null, 'garage', this.state, this.controller);
    this.winners= new WinnersView(null, 'winners', this.state, this.controller);

    this.pages = [
      { hash: 'garage', view: this.garage},
      { hash: 'winners', view: this.winners},
    ];

    const container = new Control(document.body, 'div', 'container')
    const header = new Header(container.node, 'header', this.pages);
    this.main = new Control(container.node, 'main', 'app');
    const footer = new Footer(container.node, 'footer');

    this.currentPage = this.garage
    this.main.node.appendChild(this.currentPage.node)
  }

  start() {
    this.router.change();
  }

  public createView(hash: string) {
    const route = this.pages.find((page) => page.hash === hash);
    if (route) {
      if (this.currentPage) this.currentPage.destroy();
      const view = route.view;

      if( view )
      this.currentPage = view;
      this.main.node.appendChild(this.currentPage.node)
    }
  }

  
}

export default App;
