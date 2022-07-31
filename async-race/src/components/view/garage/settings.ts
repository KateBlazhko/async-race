import Control from '../../common/control';
import Input from '../input'
import Button from '../button'
import { ICar, ISettings } from '../../state/appState'
import Signal from '../../common/signal';

enum ButtonText {
  race = "Race",
  reset = "Reset",
  generate = "Generate cars",
  stop = "Stop",
  create = "Create",
  update = "Update"
}

class Settings extends Control {
  public onGenerateCars: ()=> void
  private createInputList: Control<HTMLInputElement | HTMLButtonElement>[]
  private updateInputList: Control<HTMLInputElement | HTMLButtonElement>[]

  constructor(
    parent: HTMLElement | null,
    className: string,
    inputParams: ISettings,
    onCreateCar: Signal<Omit<ICar, 'id'>>,
    onUpdateCar: Signal<Omit<ICar, 'id'>>,
    selectedCar: number | string
  ){
    super(parent, 'div', className);
    this.onGenerateCars = () => {}
    const createField = new Control(this.node, 'div', 'settings__field field')
    this.createInputList = this.renderInputField(
      createField.node,
      ButtonText.create,
      inputParams.create,
      onCreateCar
    )

    const disable = selectedCar? false : true
    const updateField = new Control(this.node, 'div', 'settings__field field')
     this.updateInputList = this.renderInputField(
      updateField.node,
      ButtonText.update,
      inputParams.update, 
      onUpdateCar,
      disable)
    
    const buttons = new Control(this.node, 'div', 'settings__buttons')
    this.renderButton(buttons)
  }
  public onInputChange = new Signal<Omit<ISettings, 'create' | 'update'>>()

  private renderInputField(
    parent: HTMLElement,
    text: string,
    param: Record<string, string>,
    signalClick: Signal<Omit<ICar, 'id'>>,
    disable?: boolean
    ) {

    const inputName = new Input(parent, 'field__input-data', 'name', param.name, disable);
    inputName.node.oninput = () => {
      this.onInputChange.emit({
        [text.toLowerCase()]: {
          name: inputName.node.value
        }
      })
    }

    const inputColor = new Input(parent, 'field__input-color', 'color', param.color, disable);
    inputColor.node.oninput = () => {
      this.onInputChange.emit({
        [text.toLowerCase()]: {
          color: inputColor.node.value
        }
      })
    }

    const button = new Button(parent, 'button', text, disable)
    const list  = [inputName, inputColor, button]

    button.node.onclick = () => {    
      signalClick.emit({name: inputName.node.value, color: inputColor.node.value})
      this.resetInputs(list, disable) 
    }

    return list
  }

  public changeInputsUpdate(car: ICar){
    this.updateInputList.map(input => input.node.disabled = false)
    const [ inputName, inputColor ] = this.updateInputList
    inputName.node.value = car.name
    inputColor.node.value = car.color

    this.onInputChange.emit({
      update: {
        name: inputName.node.value
      }
    })
    this.onInputChange.emit({
      update: {
        color: inputColor.node.value
      }
    })
  }

  private resetInputs(list: Control<HTMLInputElement | HTMLButtonElement>[], disable?: boolean): void {
    const [ inputName, inputColor ] = list
    inputName.node.value = ''
    inputColor.node.value = '#000000'
    if (disable)
      this.updateInputList.map(input => input.node.disabled = true)
  }

  renderButton(buttons: Control) {
    const buttonRace = new Button(buttons.node, 'button', ButtonText.race)
    buttonRace.node.onclick = () => {
      this.onGenerateCars()
    }

    const buttonReset = new Button(buttons.node, 'button', ButtonText.reset, true)
    buttonReset.node.onclick = () => {
      this.onGenerateCars()
    }

    const buttonGenerateCars = new Button(buttons.node, 'button', ButtonText.generate)
    buttonGenerateCars.node.onclick = () => {
      this.onGenerateCars()
    }
  }

}

export default Settings;
