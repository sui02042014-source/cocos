import { Node } from "cc";
import { Symbol } from "./Symbol";

export class SymbolEffectManager {
  private symbols: Node[] = [];
  private isBlurred: boolean = false;

  constructor(symbols: Node[]) {
    this.symbols = symbols;
  }

  public setSymbols(symbols: Node[]): void {
    this.symbols = symbols;
  }

  public isCurrentlyBlurred(): boolean {
    return this.isBlurred;
  }

  public applyBlur(): void {
    if (this.isBlurred) return;

    this.getValidSymbols().forEach((node) => {
      const symbolComp = node.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.loadBlurredSprite();
      }
    });

    this.isBlurred = true;
  }

  public removeBlur(): void {
    if (!this.isBlurred) return;

    this.getValidSymbols().forEach((node) => {
      const symbolComp = node.getComponent(Symbol);
      if (symbolComp) {
        symbolComp.loadNormalSprite();
      }
    });

    this.isBlurred = false;
  }

  public reset(): void {
    this.removeBlur();
  }

  private getValidSymbols(): Node[] {
    return this.symbols.filter((node) => node?.isValid);
  }
}
