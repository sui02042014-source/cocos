import { _decorator, Component, Node, Button } from "cc";
const { ccclass, property } = _decorator;

import { ReelGroup } from "./ReelGroup";

@ccclass("SlotMachine")
export class SlotMachine extends Component {
  @property(ReelGroup)
  reelGroup: ReelGroup = null;

  @property(Node)
  spinButton: Node = null;

  start() {
    this.initializeSpinButton();
  }

  private initializeSpinButton() {
    if (!this.spinButton) {
      return;
    }

    const button = this.spinButton.getComponent(Button);
    if (button) {
      button.node.on(Button.EventType.CLICK, this.onSpinButtonClicked, this);
    }
  }

  private onSpinButtonClicked() {
    if (!this.reelGroup) {
      return;
    }

    if (this.reelGroup.isSpinning()) {
      return;
    }

    this.startSpin();
  }

  public startSpin() {
    if (!this.reelGroup) {
      return;
    }

    this.setButtonEnabled(false);

    this.reelGroup.spin();
  }

  private setButtonEnabled(enabled: boolean) {
    if (!this.spinButton) {
      return;
    }

    const button = this.spinButton.getComponent(Button);
    if (button) {
      button.interactable = enabled;
    }
  }

  public isSpinning(): boolean {
    return this.reelGroup ? this.reelGroup.isSpinning() : false;
  }

  public reset() {
    if (this.reelGroup) {
      this.reelGroup.reset();
    }
    this.setButtonEnabled(true);
  }

  onDestroy() {
    if (this.spinButton) {
      const button = this.spinButton.getComponent(Button);
      if (button) {
        button.node.off(Button.EventType.CLICK, this.onSpinButtonClicked, this);
      }
    }
  }
}
