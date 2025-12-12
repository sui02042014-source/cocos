import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("LoadingController")
export class LoadingController extends Component {
  @property(Node)
  private loadingText: Node = null;

  @property(Node)
  private progressFill: Node = null;

  start() {}

  update(deltaTime: number) {}
}
