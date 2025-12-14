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
  private targetSymbolNode: Node | null = null;
  private isStopRequested: boolean = false;

  private readonly ACCELERATION = 800;
  private readonly MAX_SPEED = 1500;
  private readonly MIN_SPEED_MULTIPLIER = 0.4;
  private readonly MAX_SPEED_MULTIPLIER = 1.2;
  private readonly DECELERATION = 800;
  private readonly MIN_STOP_SPEED = 100;
  private readonly BOUNCE_DISTANCE = 30;
  private readonly BOUNCE_DURATION = 0.3;

  private get symbolHeight(): number {
    return this.symbolContainer?.symbolSize.height ?? 95;
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
    if (this.symbolContainer) {
      this.symbols = this.symbolContainer.getSymbols();
    }
  }

  spin() {
    if (
      this.isSpinning() ||
      !this.symbolContainer ||
      this.symbols.length === 0
    ) {
      return;
    }

    this.stopActiveTween();
    this.targetSymbolID = -1;
    this.isStopRequested = false;
    this.targetSymbolNode = null;

    this.speedMultiplier =
      this.MIN_SPEED_MULTIPLIER +
      Math.random() * (this.MAX_SPEED_MULTIPLIER - this.MIN_SPEED_MULTIPLIER);

    this.currentSpeed = 0;
    this.currentState = ReelState.SPINNING_ACCEL;
  }

  public stop(targetSymbolID: number, callback?: () => void) {
    if (!this.isSpinning()) return;

    this.targetSymbolID = targetSymbolID;
    this.stopCallback = callback || null;
    this.isStopRequested = true;

    if (this.currentState === ReelState.SPINNING_CONST) {
      this.currentState = ReelState.STOPPING;
    }
  }

  private applyBlurEffect() {
    this.symbols
      .filter((node) => node?.isValid)
      .forEach((node) => {
        node.getComponent(Symbol)?.loadBlurredSprite();
      });
  }

  private removeBlurEffect() {
    this.symbols
      .filter((node) => node?.isValid)
      .forEach((node) => {
        node.getComponent(Symbol)?.loadNormalSprite();
      });
  }

  update(deltaTime: number) {
    if (
      this.currentState === ReelState.IDLE ||
      this.currentState === ReelState.RESULT
    ) {
      return;
    }

    switch (this.currentState) {
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
        if (this.isStopRequested) {
          this.currentState = ReelState.STOPPING;
        }
        break;

      case ReelState.STOPPING:
        this.currentSpeed -= this.DECELERATION * deltaTime;
        if (this.currentSpeed <= this.MIN_STOP_SPEED) {
          this.currentSpeed = this.MIN_STOP_SPEED;

          if (this.isBlurred) {
            this.removeBlurEffect();
            this.isBlurred = false;
          }

          if (this.shouldSnapToTarget()) {
            this.snapToTargetSymbol();
            return;
          }
        }
        break;
    }

    this.updateSymbols(deltaTime);
  }

  private updateSymbols(deltaTime: number) {
    if (this.symbols.length === 0) return;

    const scrollDistance = this.currentSpeed * deltaTime;

    this.symbols
      .filter((node) => node?.isValid)
      .forEach((node) => {
        const newY = node.position.y - scrollDistance;

        if (newY < this.RESET_Y_THRESHOLD) {
          const highestY = this.getHighestSymbolY();
          const resetY = highestY + this.getSymbolSpacing();

          this.setNodeYPosition(node, resetY);

          const symbolComp = node.getComponent(Symbol);
          if (symbolComp) {
            symbolComp.symbolID = getRandomSymbolID();
            if (this.isBlurred) {
              symbolComp.loadBlurredSprite();
            }
          }
        } else {
          this.setNodeYPosition(node, newY);
        }
      });
  }

  private getHighestSymbolY(): number {
    return this.symbols
      .filter((node) => node?.isValid)
      .reduce(
        (highest, node) => Math.max(highest, node.position.y),
        this.RESET_Y_THRESHOLD
      );
  }

  private getSymbolSpacing(): number {
    return this.symbolContainer?.symbolSpacing ?? 115;
  }

  private setNodeYPosition(node: Node, newY: number) {
    this.tempPos.set(node.position);
    this.tempPos.y = newY;
    node.setPosition(this.tempPos);
  }

  private shouldSnapToTarget(): boolean {
    if (this.targetSymbolID < 0) return false;

    this.targetSymbolNode = this.findClosestSymbolWithID(this.targetSymbolID);
    return this.targetSymbolNode !== null;
  }

  private findClosestSymbolWithID(symbolID: number): Node | null {
    let closestNode: Node | null = null;
    let closestDistance = Infinity;

    for (const node of this.symbols) {
      if (!node?.isValid) continue;

      const symbolComp = node.getComponent(Symbol);
      if (symbolComp && symbolComp.symbolID === symbolID) {
        const distance = Math.abs(node.position.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNode = node;
        }
      }
    }

    if (!closestNode) {
      const topSymbol = this.symbols
        .filter((n) => n?.isValid)
        .sort((a, b) => b.position.y - a.position.y)[0];

      if (topSymbol) {
        const symbolComp = topSymbol.getComponent(Symbol);
        if (symbolComp) {
          symbolComp.symbolID = symbolID;
          closestNode = topSymbol;
        }
      }
    }

    return closestNode;
  }

  private snapToTargetSymbol() {
    if (!this.targetSymbolNode) return;

    this.currentSpeed = 0;
    this.currentState = ReelState.RESULT;

    const currentY = this.targetSymbolNode.position.y;
    const targetY = 0;
    const offset = targetY - currentY;

    this.symbols
      .filter((node) => node?.isValid)
      .forEach((node) => {
        const newY = node.position.y + offset;
        this.setNodeYPosition(node, newY);
      });

    this.applyBounceEffect();
  }

  private applyBounceEffect() {
    if (!this.symbolContainer?.node) return;

    this.stopActiveTween();

    const containerNode = this.symbolContainer.node;
    const originalY = containerNode.position.y;
    const bounceY = originalY + this.BOUNCE_DISTANCE;

    this.activeTween = tween(containerNode)
      .to(this.BOUNCE_DURATION * 0.5, {
        position: new Vec3(
          containerNode.position.x,
          bounceY,
          containerNode.position.z
        ),
      })
      .to(
        this.BOUNCE_DURATION * 0.5,
        {
          position: new Vec3(
            containerNode.position.x,
            originalY,
            containerNode.position.z
          ),
        },
        { easing: "backOut" }
      )
      .call(() => {
        this.onStopComplete();
      })
      .start();
  }

  private onStopComplete() {
    if (this.stopCallback) {
      const callback = this.stopCallback;
      this.stopCallback = null;
      callback();
    }
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
    this.isStopRequested = false;
    this.targetSymbolNode = null;

    if (this.isBlurred) {
      this.removeBlurEffect();
      this.isBlurred = false;
    }

    if (this.symbolContainer?.node) {
      const node = this.symbolContainer.node;
      node.setPosition(node.position.x, 0, node.position.z);
    }
  }

  onDestroy() {
    this.stopActiveTween();
    this.stopCallback = null;
  }
}
