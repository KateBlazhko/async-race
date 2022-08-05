import AppLoader from './appLoader';
// import AppState, { IGarState, IWinState } from '../state/appState'
import GarModel, { IGarState } from '../state/garModel'
import WinModel, { IWinState } from '../state/winModel'



class AppController {
  public loader: AppLoader

  constructor(public model: GarModel | WinModel) {
    this.model = model
    this.loader = new AppLoader();
  }

  public getButtonDisable(state: IGarState | IWinState) {
    const pageNumber = state.pageNumber
    const pagesCount = state.pagesCount
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

    // this.getCars()
  }
 }

export default AppController;
