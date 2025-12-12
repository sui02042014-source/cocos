import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

import { Symbol } from "./Symbol";

@ccclass("SymbolContainer")
export class SymbolContainer extends Component {
  @property([Node])
  public symbolNodes: Node[] = [];

  public symbolSpacing: number = 95;

  private symbolComponents: Symbol[] = [];

  onLoad() {
    this.cacheSymbolComponents();
  }

  start() {
    this.initialize();
  }

  public initialize() {
    this.initializeSymbolPositions();
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

  public findSymbolByID(symbolID: number): Symbol | null {
    if (!Number.isInteger(symbolID) || symbolID < 0) {
      return null;
    }

    for (const symbolComp of this.symbolComponents) {
      if (symbolComp.symbolID === symbolID) {
        return symbolComp;
      }
    }
    return null;
  }

  public getSymbols(): Node[] {
    return this.symbolNodes.filter((node) => node !== null);
  }
}
