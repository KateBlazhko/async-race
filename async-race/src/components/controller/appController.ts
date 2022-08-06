import AppLoader from './appLoader';
import GarModel from '../state/garModel';
import WinModel from '../state/winModel';

class AppController {
  public loader: AppLoader;

  constructor(public model: GarModel | WinModel) {
    this.model = model;
    this.loader = new AppLoader();
  }

  public getButtonDisable() {
    const { pageNumber } = this.model.state;
    const { pagesCount } = this.model.state;
    const next = !((pageNumber + 1 <= pagesCount));
    const prev = !((pageNumber - 1 >= 1));

    return [prev, next];
  }

  public changePageNumber(pageNumber: number) {
    const { state } = this.model;

    this.model.state = {
      ...state,
      pageNumber,
    };
  }
}

export default AppController;
