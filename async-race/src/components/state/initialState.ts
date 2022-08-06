import { IGarState } from './garModel';
import { IWinState } from './winModel';

export const initialGarageState: IGarState = {
  settings: {
    create: {
      name: '',
      color: '#000000',
    },
    update: {
      name: '',
      color: '#000000',
    },
  },
  selectCar: '',
  pageNumber: 1,
  pageLimit: 7,
  carsCount: 0,
  pagesCount: 1,
};

export const initialWinnersState: IWinState = {
  pageNumber: 1,
  pageLimit: 10,
  winCount: 0,
  pagesCount: 1,
};
