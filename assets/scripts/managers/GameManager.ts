import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  private homeButton: Node = null;

  @property(Node)
  private settingsButton: Node = null;

  @property(Node)
  private pauseButton: Node = null;
}
