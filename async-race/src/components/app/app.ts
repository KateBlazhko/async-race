// import Control from '../common/control';
import Router from './router';
import AppController from '../controller/appController';
import AppState from '../state/appState'
// import AppView from '../view/appView'
import Control from '../common/control';
import GarageView from '../view/garage/garageView'
import WinnersView from '../view/winners/winnersView';
import Header from '../view/header';
import Footer from '../view/footer';

export type Page =
  {
    hash: string,
    view: typeof GarageView | typeof WinnersView,
    signal: string
  }

const pages: Page[] = [
  { hash: 'garage', view: GarageView, signal: 'onGetCars'},
  { hash: 'winners', view: WinnersView, signal: 'onGetWinners' },
];

class App {
  private router: Router;
  private state: AppState;
  private controller: AppController;
  private currentPage: GarageView | WinnersView;
  private main: Control;

  constructor() {
    this.state = new AppState();
    this.controller = new AppController(this.state);
    this.router = new Router(this);

    const container = new Control(document.body, 'div', 'container')
    const header = new Header(container.node, 'header', pages);
    this.main = new Control(container.node, 'main', 'app');
    const footer = new Footer(container.node, 'footer');
    this.currentPage = new GarageView(this.main.node, 'garage', this.state, this.controller);
  }

  start() {
    this.router.change();
  }

  public createView(hash: string) {
    const route = pages.find((page) => page.hash === hash);
    if (route) {
      if (this.currentPage) this.currentPage.destroy();
      const ViewName = route.view;

      if( ViewName )
      this.currentPage = new ViewName(this.main.node, hash, this.state, this.controller);
    }
  }

  
}

export default App;
