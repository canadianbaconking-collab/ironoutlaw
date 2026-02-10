package com.frostedlogic.ironoutlaw.gameplay;

import com.badlogic.gdx.ScreenAdapter;

public class BootScreen extends ScreenAdapter {
    private final GameRoot gameRoot;
    private boolean routed;

    public BootScreen(GameRoot gameRoot) {
        this.gameRoot = gameRoot;
    }

    @Override
    public void render(float delta) {
        if (!routed) {
            routed = true;
            gameRoot.startRun(RunConfig.defaultConfig());
        }
    }
}
