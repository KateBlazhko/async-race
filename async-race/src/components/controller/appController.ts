import AppLoader from './appLoader';
import GarModel from '../state/garModel'
import WinModel from '../state/winModel'

class AppController {
  public loader: AppLoader

  constructor(public model: GarModel | WinModel) {
    this.model = model
    this.loader = new AppLoader();
  }

  public getButtonDisable() {
    const pageNumber = this.model.state.pageNumber
    const pagesCount = this.model.state.pagesCount
    const next = (pageNumber + 1 <= pagesCount) ? false : true
    const prev = (pageNumber - 1 >= 1) ? false : true

    return [prev, next]
  }

  public changePageNumber(pageNumber: number){
    const state = this.model.state

    this.model.state = {
      ...state,
      pageNumber: pageNumber
    }
  }
 }

export default AppController;
