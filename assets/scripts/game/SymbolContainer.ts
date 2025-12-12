import { _decorator, Component, Node, Sprite, UITransform, Size } from "cc";
const { ccclass, property } = _decorator;

import { Symbol } from "./Symbol";
import { getRandomSymbolID } from "../utils/utils";
import { SYMBOL_CONFIGS } from "../configs/symbolConfigs";

@ccclass("SymbolContainer")
export class SymbolContainer extends Component {
  public symbolNodes: Node[] = [];

  @property(Number)
  public symbolSpacing: number = 115;

  @property(Size)
  public symbolSize: Size = new Size(80, 95);

  private symbolComponents: Symbol[] = [];

  onLoad() {
    this.createSymbolsFromConfig();
    this.cacheSymbolComponents();
  }

  start() {
    this.initialize();
  }

  public initialize() {
    this.initializeSymbolPositions();
  }

  private createSymbolsFromConfig() {
    this.clearSymbols();

    const symbolCount = SYMBOL_CONFIGS.length;

    const shuffledIDs = this.createShuffledSymbolIDs(symbolCount);

    for (let i = 0; i < symbolCount; i++) {
      const symbolNode = this.createSymbolNode(i);

      symbolNode.setParent(this.node);
      this.symbolNodes.push(symbolNode);

      const symbolComp = symbolNode.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.symbolID = shuffledIDs[i];
      }
    }
  }

  private createShuffledSymbolIDs(count: number): number[] {
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(i);
    }

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
    for (const node of this.symbolNodes) {
      if (node && node.isValid) {
        node.destroy();
      }
    }
    this.symbolNodes = [];
    this.symbolComponents = [];
  }

  private cacheSymbolComponents() {
    this.symbolComponents = [];
    for (const node of this.symbolNodes) {
      if (!node) continue;
      const symbolComp = node.getComponent(Symbol);
      if (symbolComp) {
        this.symbolComponents.push(symbolComp);
      }
    }
  }

  private initializeSymbolPositions() {
    const symbols = this.symbolNodes.filter((node) => node !== null);
    if (symbols.length === 0) {
      return;
    }

    const centerIndex = Math.floor(symbols.length / 2);

    const positions: number[] = [];
    for (let i = 0; i < symbols.length; i++) {
      positions.push((centerIndex - i) * this.symbolSpacing);
    }

    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    for (let i = 0; i < symbols.length; i++) {
      const node = symbols[i];
      if (!node) continue;
      const currentPos = node.position;
      node.setPosition(currentPos.x, positions[i], currentPos.z);
    }
  }

  public getSymbols(): Node[] {
    return this.symbolNodes.filter((node) => node !== null);
  }
}
