package com.frostedlogic.ironoutlaw.gameplay;

public final class RunConfig {
    public final int durationSeconds;
    public final long seed;
    public final int difficultyTier;

    public RunConfig(int durationSeconds, long seed, int difficultyTier) {
        this.durationSeconds = durationSeconds;
        this.seed = seed;
        this.difficultyTier = difficultyTier;
    }

    public static RunConfig defaultConfig() {
        return new RunConfig(75, 12345L, 1);
    }
}
