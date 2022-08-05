// import AppState, { IWinner } from '../state/appState'
import WinState, { IWinner } from '../state/winModel';
import AppController from './appController';


class WinController extends AppController{

  constructor(public model: WinState) {
    super(model)
  }

  public changePageNumber(pageNumber: number){
    const winState = this.model.state

    this.model.state = {
      ...winState,
      pageNumber: pageNumber
    }

    this.getWinners()
  }

  public async getWinners() {
    const endpoint: string = '/winners';
    const state = this.model.state
    const pageNumber = state.pageNumber

    const data = await this.loader.get({ 
      endpoint,
      gueryParams: {
          _page: pageNumber,
          _limit: state.pageLimit,
      },
    }) as IWinner[];

    if (WinState.checkWinners(data)) {
      if (data.length > 0) {
        this.model.pageWinners = {
          page: data,
          pageNumber: pageNumber
        }

      } else {
        if (pageNumber - 1 > 0) {
          this.model.state = { 
            ...this.model.state,
            pageNumber: pageNumber - 1
          }
          
          this.getWinners()
        }
      }
    }

    this.getCountWinners()
  }

  public async getCountWinners() {
    const endpoint: string = '/winners';
    const state = this.model.state

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: state.pageLimit,
      },
    }, 'X-Total-Count') 

    this.model.winCount =  Number(data) ? Number(data) : 0    
  }
 }

export default WinController;
