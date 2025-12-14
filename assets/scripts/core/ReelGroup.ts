import { _decorator, Component, Node } from "cc";
import { Reel } from "./Reel";
import { getRandomSymbolID } from "../utils/utils";
const { ccclass, property } = _decorator;

@ccclass("ReelGroup")
export class ReelGroup extends Component {
  @property([Node])
  reelNodes: Node[] = [];

  @property(Number)
  stopDelay: number = 0.3;

  private reels: Reel[] = [];
  private _isSpinning: boolean = false;
  private stoppedReelsCount: number = 0;
  private stopCallback: (() => void) | null = null;

  isSpinning(): boolean {
    return this._isSpinning;
  }

  start() {
    this.initializeReels();
  }

  private initializeReels() {
    this.reels = this.reelNodes
      .filter((node) => node !== null)
      .map((node) => node.getComponent(Reel))
      .filter((reel) => reel !== null);
  }

  spin() {
    if (this._isSpinning || this.reels.length === 0) return;

    this._isSpinning = true;
    this.stoppedReelsCount = 0;
    this.reels.forEach((reel) => reel.spin());
  }

  public stop(targetSymbols: number[], callback?: () => void) {
    if (!this._isSpinning) return;

    this.stopCallback = callback || null;
    this.stoppedReelsCount = 0;

    const symbols = this.normalizeTargetSymbols(targetSymbols);

    this.reels.forEach((reel, index) => {
      const delay = index * this.stopDelay;
      this.scheduleOnce(() => {
        reel.stop(symbols[index], () => this.onReelStopped());
      }, delay);
    });
  }

  private normalizeTargetSymbols(targetSymbols: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.reels.length; i++) {
      if (i < targetSymbols.length && targetSymbols[i] >= 0) {
        result.push(targetSymbols[i]);
      } else {
        result.push(getRandomSymbolID());
      }
    }
    return result;
  }

  private onReelStopped() {
    this.stoppedReelsCount++;

    if (this.stoppedReelsCount >= this.reels.length) {
      this._isSpinning = false;

      if (this.stopCallback) {
        const callback = this.stopCallback;
        this.stopCallback = null;
        callback();
      }
    }
  }

  reset() {
    this.unscheduleAllCallbacks();
    this._isSpinning = false;
    this.stoppedReelsCount = 0;
    this.stopCallback = null;
    this.reels.forEach((reel) => reel.reset());
  }
}
