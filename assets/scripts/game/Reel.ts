import { _decorator, Component, Node, tween, Vec3, Tween } from "cc";
const { ccclass, property } = _decorator;

import { SymbolContainer } from "./SymbolContainer";
import { Symbol } from "./Symbol";
import { ReelState } from "../configs/symbolConfigs";
import { getRandomSymbolID } from "../utils/utils";

@ccclass("Reel")
export class Reel extends Component {
  @property(SymbolContainer)
  symbolContainer: SymbolContainer = null;

  public targetSymbolID: number = -1;

  private currentState: ReelState = ReelState.IDLE;
  private currentSpeed: number = 0;
  private stopCallback: (() => void) | null = null;
  private symbols: Node[] = [];
  private speedMultiplier: number = 1;
  private activeTween: Tween<Node> | null = null;
  private isBlurred: boolean = false;

  private tempPos: Vec3 = new Vec3();

  private readonly ACCELERATION = 500;
  private readonly MAX_SPEED = 1500;

  private readonly MIN_SPEED_MULTIPLIER = 0.4;
  private readonly MAX_SPEED_MULTIPLIER = 1.2;

  private get symbolHeight(): number {
    return this.symbolContainer ? this.symbolContainer.symbolSize.height : 95;
  }

  private get RESET_Y_THRESHOLD(): number {
    return -this.symbolHeight * 3;
  }

  public isSpinning(): boolean {
    return (
      this.currentState !== ReelState.IDLE &&
      this.currentState !== ReelState.RESULT
    );
  }

  start() {
    if (!this.symbolContainer) {
      return;
    }
    this.symbols = this.symbolContainer.getSymbols();
  }

  spin() {
    if (this.isSpinning()) {
      return;
    }

    if (!this.symbolContainer || this.symbols.length === 0) {
      return;
    }

    this.stopActiveTween();

    this.speedMultiplier =
      this.MIN_SPEED_MULTIPLIER +
      Math.random() * (this.MAX_SPEED_MULTIPLIER - this.MIN_SPEED_MULTIPLIER);

    this.currentSpeed = 0;
    this.currentState = ReelState.SPINNING_ACCEL;
  }

  private applyBlurEffect() {
    for (const node of this.symbols) {
      if (!node || !node.isValid) continue;
      const symbolComp = node.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.loadBlurredSprite();
      }
    }
  }

  private removeBlurEffect() {
    for (const node of this.symbols) {
      if (!node || !node.isValid) continue;
      const symbolComp = node.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.loadNormalSprite();
      }
    }
  }

  update(deltaTime: number) {
    switch (this.currentState) {
      case ReelState.IDLE:
      case ReelState.RESULT:
        return;

      case ReelState.SPINNING_ACCEL:
        this.currentSpeed +=
          this.ACCELERATION * this.speedMultiplier * deltaTime;
        if (this.currentSpeed >= this.MAX_SPEED) {
          this.currentSpeed = this.MAX_SPEED;
          this.currentState = ReelState.SPINNING_CONST;

          if (!this.isBlurred) {
            this.applyBlurEffect();
            this.isBlurred = true;
          }
        }
        break;

      case ReelState.SPINNING_CONST:
        break;

      case ReelState.STOPPING:
        break;
    }

    this.updateSymbols(deltaTime);
  }

  private updateSymbols(deltaTime: number) {
    if (!this.symbols || this.symbols.length === 0) return;

    const scrollDistance = this.currentSpeed * deltaTime;

    for (let i = 0; i < this.symbols.length; i++) {
      const node = this.symbols[i];
      if (!node || !node.isValid) continue;

      const pos = node.position;
      const newY = pos.y - scrollDistance;

      if (newY < this.RESET_Y_THRESHOLD) {
        const highestY = this.getHighestSymbolY();
        const resetY = highestY + this.getSymbolSpacing();

        this.setNodeYPosition(node, resetY);

        const newSymbolID = getRandomSymbolID();
        const symbolComp = node.getComponent(Symbol);
        if (symbolComp) {
          symbolComp.symbolID = newSymbolID;

          if (this.isBlurred) {
            symbolComp.loadBlurredSprite();
          }
        }
      } else {
        this.setNodeYPosition(node, newY);
      }
    }
  }

  private getHighestSymbolY(): number {
    let highestY = this.RESET_Y_THRESHOLD;

    for (const node of this.symbols) {
      if (node && node.isValid && node.position.y > highestY) {
        highestY = node.position.y;
      }
    }

    return highestY;
  }

  private getSymbolSpacing(): number {
    return this.symbolContainer ? this.symbolContainer.symbolSpacing : 115;
  }

  private setNodeYPosition(node: Node, newY: number) {
    this.tempPos.set(node.position);
    this.tempPos.y = newY;
    node.setPosition(this.tempPos);
  }

  private stopActiveTween() {
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
  }

  reset() {
    this.stopActiveTween();

    this.currentState = ReelState.IDLE;
    this.currentSpeed = 0;
    this.targetSymbolID = -1;
    this.stopCallback = null;

    if (this.isBlurred) {
      this.removeBlurEffect();
      this.isBlurred = false;
    }
  }

  onDestroy() {
    this.stopActiveTween();
    this.stopCallback = null;
  }
}
