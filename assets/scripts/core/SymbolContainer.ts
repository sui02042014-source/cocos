import { _decorator, Component, Size, Node, UITransform, Sprite } from "cc";
import { SYMBOL_CONFIGS } from "../configs/symbolConfigs";
import { Symbol } from "./Symbol";

const { ccclass } = _decorator;

@ccclass("SymbolContainer")
export class SymbolContainer extends Component {
  symbolSpacing: number = 115;
  symbolSize: Size = new Size(80, 95);
  symbolNodes: Node[] = [];
  symbolComponents: Symbol[] = [];

  onLoad() {
    this.createSymbolsFromConfig();
    this.cacheSymbolComponents();
    this.initializeSymbolPositions();
  }

  createSymbolsFromConfig() {
    this.symbolNodes = SYMBOL_CONFIGS.map((config, index) => {
      const symbolNode = new Node(`Symbol${index}`);

      const uiTransform = symbolNode.addComponent(UITransform);
      uiTransform.setContentSize(this.symbolSize);

      const sprite = symbolNode.addComponent(Sprite);
      sprite.sizeMode = Sprite.SizeMode.CUSTOM;

      const symbolComp = symbolNode.addComponent(Symbol);
      symbolComp["spriteComponent"] = sprite;
      symbolComp.symbolID = config.id;

      symbolNode.setParent(this.node);

      return symbolNode;
    });
  }

  cacheSymbolComponents() {
    this.symbolComponents = this.symbolNodes
      .map((node) => node?.getComponent(Symbol))
      .filter((comp) => comp !== null) as Symbol[];
  }

  initializeSymbolPositions() {
    const centerIndex = Math.floor(this.symbolNodes.length / 2);
    const positions = this.symbolNodes.map(
      (_, i) => (centerIndex - i) * this.symbolSpacing
    );

    this.symbolNodes.forEach((node, i) => {
      node.setPosition(node.position.x, positions[i], node.position.z);
    });
  }

  getSymbols(): Node[] {
    return this.symbolNodes.filter((node) => node !== null);
  }

  getSymbolComponents(): Symbol[] {
    return this.symbolComponents.filter((comp) => comp !== null);
  }
}
