export enum SymbolType {
  CHERRY = 0,
  LEMON = 1,
  BAR = 2,
  BELL = 3,
  SEVEN = 4,
  WILD = 5,
}

export enum ReelState {
  IDLE,
  SPINNING_ACCEL,
  SPINNING_CONST,
  STOPPING,
  RESULT,
}

export interface SymbolConfig {
  id: SymbolType;
  name: string;
  normalSprite: string;
  blurredSprite: string;
  value: number;
}

export const SYMBOL_CONFIGS: SymbolConfig[] = [
  {
    id: SymbolType.CHERRY,
    name: "Cherry",
    normalSprite: "symbols/cherry/spriteFrame",
    blurredSprite: "symbols/cherry_blur/spriteFrame",
    value: 5,
  },
  {
    id: SymbolType.LEMON,
    name: "Lemon",
    normalSprite: "symbols/lemon/spriteFrame",
    blurredSprite: "symbols/lemon_blur/spriteFrame",
    value: 5,
  },
  {
    id: SymbolType.BAR,
    name: "Bar",
    normalSprite: "symbols/bar/spriteFrame",
    blurredSprite: "symbols/bar_blur/spriteFrame",
    value: 10,
  },
  {
    id: SymbolType.BELL,
    name: "Bell",
    normalSprite: "symbols/bell/spriteFrame",
    blurredSprite: "symbols/bell_blur/spriteFrame",
    value: 15,
  },
  {
    id: SymbolType.SEVEN,
    name: "Seven",
    normalSprite: "symbols/seven/spriteFrame",
    blurredSprite: "symbols/seven_blur/spriteFrame",
    value: 20,
  },
  {
    id: SymbolType.WILD,
    name: "Wild",
    normalSprite: "symbols/wild/spriteFrame",
    blurredSprite: "symbols/wild_blur/spriteFrame",
    value: 50,
  },
];
