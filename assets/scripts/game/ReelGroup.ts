import { _decorator, Component, Node } from "cc";
import { Reel } from "./Reel";
const { ccclass, property } = _decorator;

@ccclass("ReelGroup")
export class ReelGroup extends Component {
  @property([Node])
  reelNodes: Node[] = [];

  reels: Reel[] = [];

  private _isSpinning: boolean = false;

  isSpinning(): boolean {
    return this._isSpinning;
  }

  start() {
    this.initializeReels();
  }

  private initializeReels() {
    this.reels = [];
    for (let i = 0; i < this.reelNodes.length; i++) {
      const node = this.reelNodes[i];
      if (!node) {
        continue;
      }

      const reel = node.getComponent(Reel);
      if (reel) {
        this.reels.push(reel);
      }
    }
  }

  spin() {
    if (this._isSpinning) {
      return;
    }

    if (this.reels.length === 0) {
      return;
    }

    this._isSpinning = true;

    for (let i = 0; i < this.reels.length; i++) {
      this.reels[i].spin();
    }
  }

  reset() {
    this._isSpinning = false;

    for (let i = 0; i < this.reels.length; i++) {
      this.reels[i].reset();
    }
  }
}
