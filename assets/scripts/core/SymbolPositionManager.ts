import { Node, Vec3 } from "cc";
import { Symbol } from "./Symbol";
import { getRandomSymbolID } from "../utils/utils";

export class SymbolPositionManager {
  private symbols: Node[] = [];
  private tempPos: Vec3 = new Vec3();
  private symbolHeight: number = 95;
  private symbolSpacing: number = 115;

  constructor(symbols: Node[], symbolHeight: number, symbolSpacing: number) {
    this.symbols = symbols;
    this.symbolHeight = symbolHeight;
    this.symbolSpacing = symbolSpacing;
  }

  public setSymbols(symbols: Node[]): void {
    this.symbols = symbols;
  }

  public getValidSymbols(): Node[] {
    return this.symbols.filter((node) => node?.isValid);
  }

  public updatePositions(scrollDistance: number, isBlurred: boolean): void {
    const resetThreshold = this.getResetThreshold();

    this.getValidSymbols().forEach((node) => {
      const newY = node.position.y - scrollDistance;

      if (newY < resetThreshold) {
        this.resetSymbolToTop(node, isBlurred);
      } else {
        this.setYPosition(node, newY);
      }
    });
  }

  public setYPosition(node: Node, newY: number): void {
    this.tempPos.set(node.position);
    this.tempPos.y = newY;
    node.setPosition(this.tempPos);
  }

  public resetSymbolToTop(node: Node, shouldBlur: boolean): void {
    const highestY = this.getHighestSymbolY();
    const resetY = highestY + this.symbolSpacing;

    this.setYPosition(node, resetY);

    const symbolComp = node.getComponent(Symbol);
    if (symbolComp) {
      symbolComp.symbolID = getRandomSymbolID();
      if (shouldBlur) {
        symbolComp.loadBlurredSprite();
      }
    }
  }

  public getHighestSymbolY(): number {
    const resetThreshold = this.getResetThreshold();
    return this.getValidSymbols().reduce(
      (highest, node) => Math.max(highest, node.position.y),
      resetThreshold
    );
  }

  public findClosestSymbolWithID(symbolID: number): Node | null {
    let closestNode: Node | null = null;
    let closestDistance = Infinity;

    for (const node of this.symbols) {
      if (!node?.isValid) continue;

      const symbolComp = node.getComponent(Symbol);
      if (symbolComp && symbolComp.symbolID === symbolID) {
        const distance = Math.abs(node.position.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNode = node;
        }
      }
    }

    if (!closestNode) {
      closestNode = this.assignIDToTopSymbol(symbolID);
    }

    return closestNode;
  }

  public assignIDToTopSymbol(symbolID: number): Node | null {
    const validSymbols = this.getValidSymbols();
    const topSymbol = validSymbols.sort(
      (a, b) => b.position.y - a.position.y
    )[0];

    if (topSymbol) {
      const symbolComp = topSymbol.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.symbolID = symbolID;
        return topSymbol;
      }
    }

    return null;
  }

  public snapAllToTarget(targetNode: Node): void {
    const currentY = targetNode.position.y;
    const targetY = 0;
    const offset = targetY - currentY;

    this.getValidSymbols().forEach((node) => {
      const newY = node.position.y + offset;
      this.setYPosition(node, newY);
    });
  }

  private getResetThreshold(): number {
    return -this.symbolHeight * 3;
  }
}
