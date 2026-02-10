package com.frostedlogic.ironoutlaw.gameplay;

public class RunState {
    public float timeRemaining;
    public int score;
    public int destroyedCount;
    public boolean jumpedOnce;

    public RunState(float durationSeconds) {
        this.timeRemaining = durationSeconds;
    }

    public boolean isEnded() {
        return timeRemaining <= 0f;
    }
}
