import { _decorator, Component } from "cc";
import { SYMBOL_CONFIGS } from "../configs/symbolConfigs";

const { ccclass, property } = _decorator;

@ccclass("Symbol")
export class Symbol extends Component {
  @property(Number)
  private _symbolID: number = 0;

  public get symbolID(): number {
    return this._symbolID;
  }

  public set symbolID(value: number) {
    if (!Number.isInteger(value)) {
      return;
    }

    if (value < 0 || value >= SYMBOL_CONFIGS.length) {
      return;
    }

    this._symbolID = value;
  }
}
