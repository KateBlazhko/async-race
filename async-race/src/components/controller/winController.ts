// import AppState, { IWinner } from '../state/appState'
import GarModel, { ICar } from '../state/garModel';
import WinModel, { IWinner } from '../state/winModel';
import AppController from './appController';


class WinController extends AppController{

  constructor(public model: WinModel, public garModel: GarModel) {
    super(model)
    garModel.onShowWinner.add(this.createWinner.bind(this))
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

    if (WinModel.checkWinners(data)) {
      if (data.length > 0) {
        const fullData = await this.getDataAboutCar(...data)

        this.model.pageWinners = {
          page: fullData,
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

  public async getDataAboutCar(...winners: IWinner[]) {

    return Promise.all(winners.map(async(winner) => {
      const endpoint: string = `/garage/${winner.id}`;

      const data = await this.loader.get({ 
        endpoint,
        gueryParams: {},
      }) as ICar;

      return {
        ...winner,
        name: data.name,
        color: data.color
      }
    }))
    
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

  private async createWinner(lastWinner: Record<string, string | number>) {
    const endpoint: string = '/winners';
    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify({
      id: +lastWinner.id,
      wins: 1,
      time: +lastWinner.time
    })

    const result = await this.loader.post(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if (result === '500') {
      // this.updateWinners(lastWinner)
      return
    }

    if(result) {
      this.getWinners()
    }
  }

  private async getWinner(id: number) {
    const endpoint: string = `/winners/${id}`;

    return await this.loader.get({ 
      endpoint,
      gueryParams: {},
    }) as IWinner;

  }
  private async updateWinners(winner: Record<string, string | number>) {
      const lastData = await this.getWinner(+winner.id) 

      const [ fullData ] = await this.getDataAboutCar(lastData)
      console.log(fullData)

      const endpoint: string = `/garage/${fullData.id}`

    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify({
      wins: fullData.wins + 1,
      time: Math.min(lastData.time, +winner.time)
    })

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if(result) {
      this.getWinners()
    }
    
  }
 }

export default WinController;
