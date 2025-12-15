import { _decorator, Component, Node, Button } from "cc";
const { ccclass, property } = _decorator;

import { ReelGroup } from "./ReelGroup";
import { getRandomSymbolID } from "../utils/utils";

@ccclass("SlotMachine")
export class SlotMachine extends Component {
  @property(ReelGroup)
  reelGroup: ReelGroup = null;

  @property(Node)
  spinButton: Node = null;

  @property(Number)
  spinDuration: number = 1.0;

  private buttonComponent: Button = null;
  private currentResult: number[] = [];

  start() {
    this.initializeSpinButton();
  }

  private initializeSpinButton() {
    if (!this.spinButton) return;

    this.buttonComponent = this.spinButton.getComponent(Button);
    if (!this.buttonComponent) return;

    this.buttonComponent.node.on(
      Button.EventType.CLICK,
      this.onSpinButtonClicked,
      this
    );
  }

  private onSpinButtonClicked() {
    if (!this.reelGroup?.getIsSpinning()) {
      this.startSpin();
    }
  }

  public startSpin(targetSymbols?: number[]) {
    if (!this.reelGroup) return;

    this.setButtonEnabled(false);

    this.currentResult = targetSymbols || this.generateRandomResult();

    this.reelGroup.spin();

    this.scheduleOnce(() => {
      this.stopSpin();
    }, this.spinDuration);
  }

  private generateRandomResult(): number[] {
    const reelCount = this.reelGroup.reelNodes.length;
    return Array.from({ length: reelCount }, () => getRandomSymbolID());
  }

  private stopSpin() {
    if (!this.reelGroup) return;

    this.reelGroup.stop(this.currentResult, () => {
      this.onSpinComplete();
    });
  }

  private onSpinComplete() {
    this.setButtonEnabled(true);
  }

  public setResult(targetSymbols: number[]) {
    this.currentResult = targetSymbols;
  }

  public getResult(): number[] {
    return [...this.currentResult];
  }

  private setButtonEnabled(enabled: boolean) {
    if (this.buttonComponent) {
      this.buttonComponent.interactable = enabled;
    }
  }

  public isSpinning(): boolean {
    return this.reelGroup?.getIsSpinning() ?? false;
  }

  public reset() {
    this.unscheduleAllCallbacks();
    this.reelGroup?.reset();
    this.setButtonEnabled(true);
    this.currentResult = [];
  }

  onDestroy() {
    this.unscheduleAllCallbacks();
    if (this.buttonComponent) {
      this.buttonComponent.node.off(
        Button.EventType.CLICK,
        this.onSpinButtonClicked,
        this
      );
    }
  }
}
