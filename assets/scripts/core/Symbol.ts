import { _decorator, Component, resources, Sprite, SpriteFrame } from "cc";
import { getSymbolConfig } from "../utils/utils";

const { ccclass } = _decorator;

@ccclass("Symbol")
export class Symbol extends Component {
  private _symbolID: number = 0;
  private spriteComponent: Sprite = null;

  onLoad() {
    if (!this.spriteComponent) {
      this.spriteComponent = this.node.getComponent(Sprite);
    }
  }

  public get symbolID(): number {
    return this._symbolID;
  }

  public set symbolID(value: number) {
    this._symbolID = value;
    this.loadNormalSprite();
  }

  public loadBlurredSprite() {
    const config = getSymbolConfig(this._symbolID);
    if (config) {
      this.loadSprite(config.blurredSprite);
    }
  }

  public loadNormalSprite() {
    const config = getSymbolConfig(this._symbolID);
    if (config) {
      this.loadSprite(config.normalSprite);
    }
  }

  private loadSprite(spritePath: string) {
    if (!this.spriteComponent) {
      return;
    }

    resources.load(spritePath, SpriteFrame, (err, spriteFrame) => {
      if (this.spriteComponent) {
        this.spriteComponent.spriteFrame = spriteFrame;
      }
    });
  }
}
