import GarModel, { ICar } from '../state/garModel';
import WinModel, { IWinner } from '../state/winModel';
import AppController from './appController';

class WinController extends AppController {
  constructor(public model: WinModel, public garModel: GarModel) {
    super(model);
    garModel.onShowWinner.add(this.getWinner.bind(this));
    garModel.onRemoveCar.add(this.removeWinner.bind(this));
  }

  public async getWinners(sort: 'id'|'wins'|'time' = 'id', order: 'ASC'|'DESC' = 'ASC') {
    const endpoint: string = '/winners';
    const { state } = this.model;
    const { pageNumber } = state;

    const data = await this.loader.get({
      endpoint,
      gueryParams: {
        _page: pageNumber,
        _limit: state.pageLimit,
        _sort: sort,
        _order: order,
      },
    }) as IWinner[];

    if (WinModel.checkWinners(data)) {
      if (data.length > 0) {
        const fullData = await this.getDataAboutCar(...data);

        this.model.pageWinners = {
          page: fullData,
          pageNumber,
        };
      } else if (pageNumber - 1 > 0) {
        this.model.state = {
          ...this.model.state,
          pageNumber: pageNumber - 1,
        };

        this.getWinners();
      }
    }
    this.getCountWinners();
  }

  public async getDataAboutCar(...winners: IWinner[]) {
    return Promise.all(winners.map(async (winner) => {
      // console.log(winner.id);
      const endpoint: string = `/garage/${winner.id}`;

      const data = await this.loader.get({
        endpoint,
        gueryParams: {},
      }) as ICar;

      return {
        ...winner,
        name: data.name,
        color: data.color,
      };
    }));
  }

  public async getCountWinners() {
    const endpoint: string = '/winners';
    const { state } = this.model;

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: state.pageLimit,
      },
    }, 'X-Total-Count');

    this.model.winCount = Number(data) ? Number(data) : 0;
  }

  private async createWinner(lastWinner: Record<string, string | number>) {
    try {
      const endpoint: string = '/winners';
      const headers = { 'Content-Type': 'application/json' };
      const body = JSON.stringify({
        id: +lastWinner.id,
        wins: 1,
        time: +lastWinner.time,
      });

      const result = await this.loader.post(
        { endpoint, gueryParams: {} },
        headers,
        body,
      );

      if (result) {
        this.getWinners();
      }
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
    }
  }

  private async getWinner(newData: Record<string, string | number>) {
    try {
      const endpoint: string = `/winners/${newData.id}`;

      const result = await this.loader.get({
        endpoint,
        gueryParams: {},
      }) as IWinner;

      if (result) {
        this.updateWinner({
          wins: result.wins + 1,
          time: Math.min(result.time, +newData.time),
        }, result.id);
        return;
      }

      throw new Error("This car doesn't seem to have won yet, record the results...");
    } catch (e: unknown) {
      const error = e as Error;
      this.createWinner(newData);

      console.error(error.message);
    }
  }

  private async updateWinner(newData: Record<string, string | number>, id: number) {
    const endpoint: string = `/winners/${id}`;

    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify(newData);

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body,
    );

    if (result) {
      this.getWinners();
    }
  }

  public async removeWinner(id: number) {
    const endpoint: string = `/winners/${id}`;

    const result = await this.loader.delete(
      { endpoint, gueryParams: {} },
    );

    if (result) {
      this.getWinners();
    }
  }
}

export default WinController;
