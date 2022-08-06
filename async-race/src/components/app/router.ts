import App, { Page } from './app';

class Router {
  private hash: string;

  constructor(
    private app: App,
    private pages: Page[],
  ) {
    this.app = app;
    this.hash = window.location.hash.slice(1);
    this.pages = pages;
  }

  public getPage() {
    const route = this.pages.find((page) => page.hash === this.hash);

    if (route) {
      return route.view;
    }
    const [firstPage] = this.pages;
    return firstPage.view;
  }

  public change() {
    window.addEventListener('hashchange', () => {
      this.hash = window.location.hash.slice(1);
      this.app.createView();
    });
  }
}

export default Router;
