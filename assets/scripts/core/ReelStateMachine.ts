import { ReelState } from "../configs/symbolConfigs";

export type StateChangeCallback = (
  newState: ReelState,
  oldState: ReelState
) => void;

export class ReelStateMachine {
  private currentState: ReelState = ReelState.IDLE;
  private onStateChangeCallback: StateChangeCallback | null = null;

  public getCurrentState(): ReelState {
    return this.currentState;
  }

  public setState(newState: ReelState): void {
    const oldState = this.currentState;
    this.currentState = newState;

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState, oldState);
    }
  }

  public onStateChange(callback: StateChangeCallback): void {
    this.onStateChangeCallback = callback;
  }

  public isIdle(): boolean {
    return this.currentState === ReelState.IDLE;
  }

  public isSpinning(): boolean {
    return (
      this.currentState !== ReelState.IDLE &&
      this.currentState !== ReelState.RESULT
    );
  }

  public isAccelerating(): boolean {
    return this.currentState === ReelState.SPINNING_ACCEL;
  }

  public isConstantSpeed(): boolean {
    return this.currentState === ReelState.SPINNING_CONST;
  }

  public isStopping(): boolean {
    return this.currentState === ReelState.STOPPING;
  }

  public isResult(): boolean {
    return this.currentState === ReelState.RESULT;
  }

  public canSpin(): boolean {
    return this.isIdle() || this.isResult();
  }

  public canStop(): boolean {
    return this.isSpinning();
  }

  public reset(): void {
    this.setState(ReelState.IDLE);
  }
}
