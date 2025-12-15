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
  private isSpinning: boolean = false;
  private reelsStoppedCount: number = 0;
  private stopCallback: (() => void) | null = null;

  public getIsSpinning(): boolean {
    return this.isSpinning;
  }

  start() {
    this.reels = this.reelNodes
      .filter((node) => node !== null)
      .map((node) => node.getComponent(Reel))
      .filter((reel) => reel !== null) as Reel[];
  }

  public spin(): boolean {
    if (this.isSpinning || this.reels.length === 0) {
      return false;
    }

    this.isSpinning = true;
    this.reelsStoppedCount = 0;
    this.reels.forEach((reel) => reel.spin());

    return true;
  }

  public stop(targetSymbols: number[], callback?: () => void): void {
    if (!this.isSpinning) return;

    this.stopCallback = callback || null;
    this.reelsStoppedCount = 0;

    const normalizedSymbols = this.normalizeTargetSymbols(targetSymbols);

    this.reels.forEach((reel, index) => {
      const delay = index * this.stopDelay;
      this.scheduleOnce(() => {
        reel.stop(normalizedSymbols[index], () => this.onReelStopped());
      }, delay);
    });
  }

  private normalizeTargetSymbols(targetSymbols: number[]): number[] {
    return Array.from(
      { length: this.reels.length },
      (_, i) => targetSymbols[i] ?? getRandomSymbolID()
    );
  }

  private onReelStopped(): void {
    this.reelsStoppedCount++;

    if (this.reelsStoppedCount >= this.reels.length) {
      this.isSpinning = false;

      if (this.stopCallback) {
        const callback = this.stopCallback;
        this.stopCallback = null;
        callback();
      }
    }
  }

  public reset(): void {
    this.unscheduleAllCallbacks();

    this.isSpinning = false;
    this.reelsStoppedCount = 0;
    this.stopCallback = null;

    this.reels.forEach((reel) => reel.reset());
  }

  onDestroy(): void {
    this.reset();
  }
}
