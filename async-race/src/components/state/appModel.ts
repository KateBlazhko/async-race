import Signal from "../common/signal";

class AppModel {
  public _lastWinner: Record<string, string>

  get lastWinner() {
    return this._lastWinner;
  }
  set lastWinner(value: Record<string, string>) {
    this._lastWinner = value;
    // this.garageState = {
    //   ...this.garageState,
    //   winners: {
    //     ...this.garageState.winners,
    //     ...value
    //   }
    // }
    this.onShowWinner.emit(this._lastWinner)
  }

  constructor() {
    this._lastWinner = {}
  }

  public onShowWinner = new Signal<Record<string, string>>();

}

export default AppModel