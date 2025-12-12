import { SYMBOL_CONFIGS, SymbolConfig } from "../configs/symbolConfigs";

export function getRandomSymbolID(): number {
  return Math.floor(Math.random() * SYMBOL_CONFIGS.length);
}

export function getSymbolConfig(id: number): SymbolConfig | null {
  if (!Number.isInteger(id)) {
    return null;
  }

  if (id < 0 || id >= SYMBOL_CONFIGS.length) {
    return null;
  }

  return SYMBOL_CONFIGS[id];
}
