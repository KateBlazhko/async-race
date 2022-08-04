// import Control from '../common/control';
// import GarageView from './garage/garageView'
// import WinnersView from './winners/winnersView';
// import Header from './header';
// import Footer from './footer';
// import AppController from '../controller/appController';
// import AppState from '../state/appState';

// export type Page =
//   {
//     hash: string,
//     view: typeof GarageView | typeof WinnersView,
//     signal: string
//   }

// const pages: Page[] = [
//   { hash: 'garage', view: GarageView, signal: 'onGetCars'},
//   { hash: 'winners', view: WinnersView, signal: 'onGetWinners' },
// ];

// class AppView {
//   private currentPage: GarageView | WinnersView;
//   private main: Control;

//   constructor(
//     private controller: AppController,
//     private state: AppState
//   ) {
//     this.state = state
//     this.controller = controller
//     const container = new Control(document.body, 'div', 'container')
//     const header = new Header(container.node, 'header', pages);
//     this.main = new Control(container.node, 'main', 'app');
//     const footer = new Footer(container.node, 'footer');
//     this.currentPage = new GarageView(this.main.node, 'garage', this.state, this.controller);
//   }

//   public createView(hash: string) {
//     const route = pages.find((page) => page.hash === hash);
//     if (route) {

      
//       if (this.currentPage) this.currentPage.destroy();
//       const ViewName = route.view;

//       if( ViewName )
//       this.currentPage = new ViewName(this.main.node, hash, this.state, this.controller);
//     }
//   }

//   // public render(hash: string) {


//   // }
// }

// export default AppView