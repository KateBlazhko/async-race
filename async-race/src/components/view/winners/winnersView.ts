import Control from '../../common/control';
import AppController from '../../controller/appController';
import AppState, { IPageWinners, IWinner } from '../../state/appState'
import Button from '../button';
import Pagination from '../pagination';
import Signal from '../../common/signal';
import Winner from './winner';

enum TextContent {
  title = 'Winners 0',
  subtitle = 'Page#1',
  prevButton = 'Prev',
  nextButton = "Next",
  number = 'Number',
  car = "Car", 
  name = 'Name',
  wins = "Wins",
  time = "Best time"
}

class WinnersView extends Control {
  private state: AppState
  private controller: AppController
  private winners: Control;

  private title: Control
  private subtitle: Control
  private pagination: Pagination;
  private list: Winner[]

  constructor(parent: HTMLElement | null, className: string, state: AppState, controller: AppController) {
    super(parent, 'div', className);
    this.state = state
    this.controller = controller
    this.list = []

    const titleWrap = new Control(this.node, 'div', 'title-wrap')
    this.title = new Control(titleWrap.node, 'h2', 'title title_h2', TextContent.title)
    this.subtitle = new Control(titleWrap.node, 'h3', 'title title_h3', TextContent.subtitle)

    this.winners = new Control(this.node, 'div', 'winners__list');
    this.renderHeader()

    this.pagination = new Pagination(this.node, 'pagination')
    this.init()
  }

  public init() {
    this.addToSignal()
    
    this.getWinners()
  }

  public getWinners() {
    this.controller.getWinners()
  }

  public renderWinners(winners: IPageWinners) {
    this.updateSubtitle(winners.pageNumber)

    if (this.list.length > 0) this.list.map(car => car.destroy())

    this.list = winners.page.map(car => {
      return new Winner (
        this.winners.node, 
        'winners__winner', 
        car, 
        this.onSortByWins, 
        this.onSortByTimes
      )
    })
  }
  public onSortByWins = new Signal<IWinner>()
  public onSortByTimes = new Signal<IWinner>()

  private initPagination() {
    const initialSate = this.controller.getButtonDisable(this.state.winnersState)

    this.pagination.render(initialSate)

    this.pagination.onPrev = (button: Button) => {
      this.controller.changePageNumber(this.state.garageState.pageNumber - 1)
      const [ prev ] = this.controller.getButtonDisable(this.state.winnersState)

      button.node.disabled = prev
    }

    this.pagination.onNext = (button: Button) => {
      this.controller.changePageNumber(this.state.garageState.pageNumber + 1)
      const [ _prev, next ] = this.controller.getButtonDisable(this.state.winnersState)

      button.node.disabled = next
    }
  }

  private updateTitle(carsCount: number) {
    this.title.node.textContent = `Winners ${carsCount}`
  }

  private updateSubtitle(ageNumber: number){
    this.subtitle.node.textContent = `Page#${ageNumber}`

  }

  private addToSignal() {
    this.state.onGetWinners.add(this.renderWinners.bind(this))
    this.state.onGetWinnersCount.add(this.initPagination.bind(this))
    this.state.onGetWinnersCount.add(this.updateTitle.bind(this))

  }

  private renderHeader() {
    new Control(this.winners.node, 'span', 'winners__header', TextContent.number)
    new Control(this.winners.node, 'span', 'winners__header', TextContent.car)
    new Control(this.winners.node, 'span', 'winners__header', TextContent.name)
    new Control(this.winners.node, 'span', 'winners__header', TextContent.wins)
    new Control(this.winners.node, 'span', 'winners__header', TextContent.time)

  }
}

export default WinnersView;
