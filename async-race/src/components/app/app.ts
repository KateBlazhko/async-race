import Control from '../common/control'
import Router from './router'
import Header from '../view/header'
import GarageView from '../view/garage/garageView'
import WinnersView from '../view/winners/winnersView';

export type Page = 
  {
    hash: string,
    view: typeof GarageView | typeof WinnersView
  }
  
const pages: Page[] = [
  { hash: "garage", view: GarageView },
  { hash: "winners", view: WinnersView },
]

class App{
  private router: Router;
  private main: Control;
  private currentPage: Control | null

  constructor() {
    this.router = new Router(this)
    const header = new Header(document.body, "header", pages)
    this.main = new Control(document.body, "main", "app")
    const footer = new Control(document.body, "footer", "footer")
    this.currentPage = new GarageView(this.main.node, 'garage')
  }

  start() {
    this.router.change()
  }

  public createView(hash: string) {
    const page = pages.find(page => page.hash === hash)

    if (page) {
      if(this.currentPage) this.currentPage.destroy()
      const viewName = page.view
      this.currentPage = new viewName(this.main.node, hash)
    }
  }
}

export default App