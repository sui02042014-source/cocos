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
    normalSprite: "sprites/symbols/cherry",
    blurredSprite: "sprites/symbols/cherry_blur",
    value: 5,
  },
  {
    id: SymbolType.LEMON,
    name: "Lemon",
    normalSprite: "sprites/symbols/lemon",
    blurredSprite: "sprites/symbols/lemon_blur",
    value: 5,
  },
  {
    id: SymbolType.BAR,
    name: "Bar",
    normalSprite: "sprites/symbols/bar",
    blurredSprite: "sprites/symbols/bar_blur",
    value: 10,
  },
  {
    id: SymbolType.BELL,
    name: "Bell",
    normalSprite: "sprites/symbols/bell",
    blurredSprite: "sprites/symbols/bell_blur",
    value: 15,
  },
  {
    id: SymbolType.SEVEN,
    name: "Seven",
    normalSprite: "sprites/symbols/seven",
    blurredSprite: "sprites/symbols/seven_blur",
    value: 20,
  },
  {
    id: SymbolType.WILD,
    name: "Wild",
    normalSprite: "sprites/symbols/wild",
    blurredSprite: "sprites/symbols/wild_blur",
    value: 50,
  },
];
