/**
 * ReelPhysics
 * Responsibility: Handle all physics calculations (speed, acceleration, deceleration)
 */

interface ReelPhysicsConfig {
  readonly ACCELERATION: number;
  readonly MAX_SPEED: number;
  readonly MIN_SPEED_MULTIPLIER: number;
  readonly MAX_SPEED_MULTIPLIER: number;
  readonly DECELERATION: number;
  readonly MIN_STOP_SPEED: number;
}

export class ReelPhysics {
  private currentSpeed: number = 0;
  private speedMultiplier: number = 1;

  constructor(private config: ReelPhysicsConfig) {}

  public randomizeSpeedMultiplier(): void {
    this.speedMultiplier =
      this.config.MIN_SPEED_MULTIPLIER +
      Math.random() *
        (this.config.MAX_SPEED_MULTIPLIER - this.config.MIN_SPEED_MULTIPLIER);
  }

  public accelerate(deltaTime: number): void {
    this.currentSpeed +=
      this.config.ACCELERATION * this.speedMultiplier * deltaTime;

    if (this.currentSpeed >= this.config.MAX_SPEED) {
      this.currentSpeed = this.config.MAX_SPEED;
    }
  }

  public decelerate(deltaTime: number): void {
    this.currentSpeed -= this.config.DECELERATION * deltaTime;

    if (this.currentSpeed <= this.config.MIN_STOP_SPEED) {
      this.currentSpeed = this.config.MIN_STOP_SPEED;
    }
  }

  public calculateScrollDistance(deltaTime: number): number {
    return this.currentSpeed * deltaTime;
  }

  public hasReachedMaxSpeed(): boolean {
    return this.currentSpeed >= this.config.MAX_SPEED;
  }

  public hasReachedMinSpeed(): boolean {
    return this.currentSpeed <= this.config.MIN_STOP_SPEED;
  }

  public getCurrentSpeed(): number {
    return this.currentSpeed;
  }

  public reset(): void {
    this.currentSpeed = 0;
    this.speedMultiplier = 1;
  }
}
