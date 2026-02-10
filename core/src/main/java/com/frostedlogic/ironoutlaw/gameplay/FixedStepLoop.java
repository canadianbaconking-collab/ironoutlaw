package com.frostedlogic.ironoutlaw.gameplay;

public class FixedStepLoop {
    public static final float STEP = 1f / 60f;
    private static final float MAX_ACCUMULATOR = 0.25f;
    private float accumulator;

    public interface TickConsumer {
        void tick(float dt);
    }

    public int advance(float frameDelta, TickConsumer tickConsumer) {
        accumulator += Math.min(frameDelta, MAX_ACCUMULATOR);
        int ticks = 0;
        while (accumulator >= STEP) {
            tickConsumer.tick(STEP);
            accumulator -= STEP;
            ticks++;
        }
        return ticks;
    }
}
