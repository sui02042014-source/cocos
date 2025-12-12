import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MainMenu")
export class MainMenu extends Component {
  @property(Node)
  private playButton: Node = null;

  @property(Node)
  private settingsButton: Node = null;

  @property(Node)
  private quitButton: Node = null;

  @property(Node)
  private paytableButton: Node = null;

  start() {}

  update(deltaTime: number) {}
}
