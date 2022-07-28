import App, { Page } from './app';
// import AppView, { Page } from './app'

interface MatchPage {
  route: Page,
  result: RegExpMatchArray;
}

class Router {
  constructor(private app: App) {
    this.app = app;
  }

  public change() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      this.app.createView(hash);
    });
  }
}

export default Router;
