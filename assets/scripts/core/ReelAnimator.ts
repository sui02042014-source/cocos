import { Node, tween, Vec3, Tween } from "cc";

interface AnimationConfig {
  readonly BOUNCE_DISTANCE: number;
  readonly BOUNCE_DURATION: number;
}

export class ReelAnimator {
  private activeTween: Tween<Node> | null = null;
  private containerNode: Node | null = null;

  constructor(containerNode: Node | null, private config: AnimationConfig) {
    this.containerNode = containerNode;
  }

  public setContainerNode(node: Node | null): void {
    this.containerNode = node;
  }

  public playBounceEffect(onComplete: () => void): void {
    if (!this.containerNode) return;

    this.stopAllTweens();

    const originalY = this.containerNode.position.y;
    const bounceY = originalY + this.config.BOUNCE_DISTANCE;

    this.activeTween = tween(this.containerNode)
      .to(this.config.BOUNCE_DURATION * 0.5, {
        position: new Vec3(
          this.containerNode.position.x,
          bounceY,
          this.containerNode.position.z
        ),
      })
      .to(
        this.config.BOUNCE_DURATION * 0.5,
        {
          position: new Vec3(
            this.containerNode.position.x,
            originalY,
            this.containerNode.position.z
          ),
        },
        { easing: "backOut" }
      )
      .call(() => {
        onComplete();
      })
      .start();
  }

  public stopAllTweens(): void {
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
  }

  public resetContainerPosition(): void {
    if (this.containerNode) {
      this.containerNode.setPosition(
        this.containerNode.position.x,
        0,
        this.containerNode.position.z
      );
    }
  }

  public cleanup(): void {
    this.stopAllTweens();
    this.containerNode = null;
  }
}
