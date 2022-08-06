import Control from '../../common/control';
import WinController from '../../controller/winController'
import Button from '../button';
import Pagination from '../pagination';
import Signal from '../../common/signal';
import Winner from './winner';
import WinModel, { IWinner, IPageWinners }  from '../../state/winModel';

enum TextContent {
  title = 'Winners 0',
  subtitle = '#1',
  prevButton = 'Prev',
  nextButton = "Next",
  number = 'Number',
  car = "Car", 
  name = 'Name',
  wins = "Wins",
  time = "Best time"
}

class WinView extends Control {
  private model: WinModel
  private controller: WinController
  private winners: Control;

  private title: Control
  private subtitle: Control
  private pagination: Pagination;
  private list: Winner[]

  constructor(parent: HTMLElement | null, className: string, model: WinModel, controller: WinController) {
    super(parent, 'div', className);
    this.model = model
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

  private init() {
    this.addToSignal()
    
    this.getWinners()
  }

  private getWinners() {
    this.controller.getWinners()
  }


  private renderWinners(winners: IPageWinners) {
    this.updateSubtitle(winners.pageNumber)

    if (this.list.length > 0) this.list.map(car => car.destroy())

    this.list = winners.page.map((winner, index) => {
      return new Winner (
        this.winners.node, 
        'winners__row',
        index + 1,
        winner, 
        this.onSortByWins, 
        this.onSortByTimes
      )
    })
  }
  public onSortByWins = new Signal<IWinner>()
  public onSortByTimes = new Signal<IWinner>()

  private initPagination() {
    const initialSate = this.controller.getButtonDisable()

    this.pagination.render(initialSate)

    this.pagination.onPrev = (button: Button) => {
      this.controller.changePageNumber(this.model.state.pageNumber - 1)
      this.getWinners()
      const [ prev ] = this.controller.getButtonDisable()

      button.node.disabled = prev
    }

    this.pagination.onNext = (button: Button) => {
      this.controller.changePageNumber(this.model.state.pageNumber + 1)
      this.getWinners()
      const [ _prev, next ] = this.controller.getButtonDisable()

      button.node.disabled = next
    }
  }

  private updateTitle(carsCount: number) {
    this.title.node.textContent = `Winners ${carsCount}`
  }

  private updateSubtitle(pageNumber: number){
    this.subtitle.node.textContent = `#${pageNumber}`

  }

  private addToSignal() {
    this.model.onGetWinners.add(this.renderWinners.bind(this))

    this.model.onGetWinCount.add(this.initPagination.bind(this))
    this.model.onGetWinCount.add(this.updateTitle.bind(this))

  }

  private renderHeader() {
    const row = new Control(this.winners.node, 'div', 'winners__row winners__row_header')
    new Control(row.node, 'span', 'winners__cell', TextContent.number)
    new Control(row.node, 'span', 'winners__cell', TextContent.car)
    new Control(row.node, 'span', 'winners__cell', TextContent.name)
    new Control(row.node, 'span', 'winners__cell', TextContent.wins)
    new Control(row.node, 'span', 'winners__cell', TextContent.time)

  }
}

export default WinView;
