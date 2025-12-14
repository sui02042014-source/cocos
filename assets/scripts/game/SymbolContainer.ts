import { _decorator, Component, Node, Sprite, UITransform, Size } from "cc";
const { ccclass, property } = _decorator;

import { Symbol } from "./Symbol";
import { SYMBOL_CONFIGS } from "../configs/symbolConfigs";

@ccclass("SymbolContainer")
export class SymbolContainer extends Component {
  @property(Number)
  public symbolSpacing: number = 115;

  @property(Size)
  public symbolSize: Size = new Size(80, 95);

  public symbolNodes: Node[] = [];
  private symbolComponents: Symbol[] = [];

  onLoad() {
    this.createSymbolsFromConfig();
    this.cacheSymbolComponents();
  }

  start() {
    this.initializeSymbolPositions();
  }

  private createSymbolsFromConfig() {
    this.clearSymbols();

    const shuffledIDs = this.createShuffledSymbolIDs(SYMBOL_CONFIGS.length);

    shuffledIDs.forEach((id, index) => {
      const symbolNode = this.createSymbolNode(index);
      symbolNode.setParent(this.node);
      this.symbolNodes.push(symbolNode);

      const symbolComp = symbolNode.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.symbolID = id;
      }
    });
  }

  private createShuffledSymbolIDs(count: number): number[] {
    const ids = Array.from({ length: count }, (_, i) => i);

    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    return ids;
  }

  private createSymbolNode(index: number): Node {
    const node = new Node(`Symbol${index}`);

    const uiTransform = node.addComponent(UITransform);
    uiTransform.setContentSize(this.symbolSize);

    const sprite = node.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;

    node.addComponent(Symbol);

    return node;
  }

  private clearSymbols() {
    this.symbolNodes
      .filter((node) => node?.isValid)
      .forEach((node) => node.destroy());

    this.symbolNodes = [];
    this.symbolComponents = [];
  }

  private cacheSymbolComponents() {
    this.symbolComponents = this.symbolNodes
      .map((node) => node?.getComponent(Symbol))
      .filter((comp) => comp !== null);
  }

  private initializeSymbolPositions() {
    const symbols = this.symbolNodes.filter((node) => node !== null);
    if (symbols.length === 0) return;

    const centerIndex = Math.floor(symbols.length / 2);
    const positions = symbols.map(
      (_, i) => (centerIndex - i) * this.symbolSpacing
    );

    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    symbols.forEach((node, i) => {
      const currentPos = node.position;
      node.setPosition(currentPos.x, positions[i], currentPos.z);
    });
  }

  public getSymbols(): Node[] {
    return this.symbolNodes.filter((node) => node !== null);
  }
}
