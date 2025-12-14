import { _decorator, Component, Sprite, resources, SpriteFrame } from "cc";
import { SYMBOL_CONFIGS } from "../configs/symbolConfigs";
import { getSymbolConfig } from "../utils/utils";

const { ccclass, property } = _decorator;

@ccclass("Symbol")
export class Symbol extends Component {
  @property(Number)
  private _symbolID: number = 0;

  @property(Sprite)
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
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value >= SYMBOL_CONFIGS.length
    ) {
      return;
    }

    this._symbolID = value;
    this.loadSpriteFromConfig();
  }

  private loadSpriteFromConfig() {
    const config = getSymbolConfig(this._symbolID);
    if (config) {
      this.loadSprite(config.normalSprite);
    }
  }

  private loadSprite(spritePath: string) {
    if (!this.spriteComponent) {
      this.spriteComponent = this.node.getComponent(Sprite);
    }

    if (!this.spriteComponent) return;

    resources.load(spritePath, SpriteFrame, (err, spriteFrame) => {
      if (!err && this.spriteComponent) {
        this.spriteComponent.spriteFrame = spriteFrame;
      }
    });
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
}
