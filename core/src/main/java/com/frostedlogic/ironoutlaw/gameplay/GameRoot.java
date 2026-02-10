package com.frostedlogic.ironoutlaw.gameplay;

import com.badlogic.gdx.Game;

/**
 * GameRoot is the stable, minimal glue layer that owns screen routing.
 * Keep LibGDX platform glue in launchers; keep game logic outside.
 */
public class GameRoot extends Game {

    @Override
    public void create() {
        setScreen(new BootScreen(this));
    }

    public void startRun(RunConfig runConfig) {
        setScreen(new DistrictRunScreen(this, runConfig));
    }

    public void showResults(int score, RunConfig runConfig) {
        setScreen(new ResultsScreen(this, score, runConfig));
    }

    public void showOverworld() {
        setScreen(new OverworldScreen(this));
    }
}
