import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

import { SymbolContainer } from "./SymbolContainer";
import { ReelState } from "../configs/symbolConfigs";
import { ReelPhysics } from "./ReelPhysics";
import { ReelStateMachine } from "./ReelStateMachine";
import { SymbolPositionManager } from "./SymbolPositionManager";
import { SymbolEffectManager } from "./SymbolEffectManager";
import { ReelAnimator } from "./ReelAnimator";

const REEL_CONFIG = {
  ACCELERATION: 800,
  MAX_SPEED: 1500,
  MIN_SPEED_MULTIPLIER: 0.4,
  MAX_SPEED_MULTIPLIER: 1.2,
  DECELERATION: 800,
  MIN_STOP_SPEED: 100,
  BOUNCE_DISTANCE: 30,
  BOUNCE_DURATION: 0.3,
};

@ccclass("Reel")
export class Reel extends Component {
  @property(SymbolContainer)
  symbolContainer: SymbolContainer = null;

  public targetSymbolID: number = -1;

  private physics: ReelPhysics;
  private stateMachine: ReelStateMachine;
  private positionManager: SymbolPositionManager;
  private effectManager: SymbolEffectManager;
  private animator: ReelAnimator;

  private symbols: Node[] = [];
  private stopCallback: (() => void) | null = null;
  private isStopRequested: boolean = false;
  private targetSymbolNode: Node | null = null;

  onLoad() {
    this.initializeComponents();
  }

  start() {
    if (this.symbolContainer) {
      this.symbols = this.symbolContainer.getSymbols();
      this.positionManager.setSymbols(this.symbols);
      this.effectManager.setSymbols(this.symbols);
    }
  }

  private initializeComponents(): void {
    const symbolHeight = this.symbolContainer?.symbolSize.height ?? 95;
    const symbolSpacing = this.symbolContainer?.symbolSpacing ?? 115;

    this.physics = new ReelPhysics(REEL_CONFIG);
    this.stateMachine = new ReelStateMachine();
    this.positionManager = new SymbolPositionManager(
      [],
      symbolHeight,
      symbolSpacing
    );
    this.effectManager = new SymbolEffectManager([]);
    this.animator = new ReelAnimator(this.symbolContainer?.node, {
      BOUNCE_DISTANCE: REEL_CONFIG.BOUNCE_DISTANCE,
      BOUNCE_DURATION: REEL_CONFIG.BOUNCE_DURATION,
    });
  }

  public isSpinning(): boolean {
    return this.stateMachine.isSpinning();
  }

  public spin(): void {
    if (!this.canSpin()) {
      return;
    }

    this.animator.stopAllTweens();
    this.resetSpinState();

    this.physics.randomizeSpeedMultiplier();
    this.physics.reset();
    this.stateMachine.setState(ReelState.SPINNING_ACCEL);
  }

  public stop(targetSymbolID: number, callback?: () => void): void {
    if (!this.stateMachine.canStop()) return;

    this.targetSymbolID = targetSymbolID;
    this.stopCallback = callback || null;
    this.isStopRequested = true;

    if (this.stateMachine.isConstantSpeed()) {
      this.stateMachine.setState(ReelState.STOPPING);
    }
  }

  public reset(): void {
    this.animator.stopAllTweens();

    this.stateMachine.reset();
    this.physics.reset();
    this.effectManager.reset();
    this.animator.resetContainerPosition();

    this.resetSpinState();
  }

  update(deltaTime: number) {
    if (!this.stateMachine.isSpinning()) {
      return;
    }

    const currentState = this.stateMachine.getCurrentState();
    let shouldUpdatePositions = true;

    switch (currentState) {
      case ReelState.SPINNING_ACCEL:
        this.handleAccelerationState(deltaTime);
        break;

      case ReelState.SPINNING_CONST:
        this.handleConstantSpeedState();
        break;

      case ReelState.STOPPING:
        shouldUpdatePositions = !this.handleStoppingState(deltaTime);
        break;
    }

    if (shouldUpdatePositions) {
      const scrollDistance = this.physics.calculateScrollDistance(deltaTime);
      this.positionManager.updatePositions(
        scrollDistance,
        this.effectManager.isCurrentlyBlurred()
      );
    }
  }

  private handleAccelerationState(deltaTime: number): void {
    this.physics.accelerate(deltaTime);

    if (this.physics.hasReachedMaxSpeed()) {
      this.stateMachine.setState(ReelState.SPINNING_CONST);
      this.effectManager.applyBlur();
    }
  }

  private handleConstantSpeedState(): void {
    if (this.isStopRequested) {
      this.stateMachine.setState(ReelState.STOPPING);
    }
  }

  private handleStoppingState(deltaTime: number): boolean {
    this.physics.decelerate(deltaTime);

    if (this.physics.hasReachedMinSpeed()) {
      this.effectManager.removeBlur();

      if (this.targetSymbolID >= 0 && !this.targetSymbolNode) {
        this.targetSymbolNode = this.positionManager.findClosestSymbolWithID(
          this.targetSymbolID
        );
      }

      if (this.shouldSnapToTarget()) {
        this.performSnapToTarget();
        return true;
      }
    }

    return false;
  }

  private performSnapToTarget(): void {
    if (!this.targetSymbolNode) return;

    this.physics.reset();
    this.stateMachine.setState(ReelState.RESULT);

    this.positionManager.snapAllToTarget(this.targetSymbolNode);
    this.animator.playBounceEffect(() => {
      this.onStopComplete();
    });
  }

  private canSpin(): boolean {
    return (
      this.stateMachine.canSpin() &&
      this.symbolContainer != null &&
      this.symbols.length > 0
    );
  }

  private shouldSnapToTarget(): boolean {
    return (
      this.physics.hasReachedMinSpeed() &&
      this.targetSymbolID >= 0 &&
      this.targetSymbolNode !== null
    );
  }

  private resetSpinState(): void {
    this.targetSymbolID = -1;
    this.isStopRequested = false;
    this.targetSymbolNode = null;
  }

  private onStopComplete(): void {
    if (this.stopCallback) {
      const callback = this.stopCallback;
      this.stopCallback = null;
      callback();
    }
  }

  onDestroy() {
    this.animator.cleanup();
    this.stopCallback = null;
  }
}
