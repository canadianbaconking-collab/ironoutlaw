package com.frostedlogic.ironoutlaw.gameplay;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.GL20;
import com.frostedlogic.ironoutlaw.ui.ResultsRenderer;

public class ResultsScreen extends ScreenAdapter {
    private final GameRoot gameRoot;
    private final int score;
    private final ResultsRenderer resultsRenderer = new ResultsRenderer();
    private float cooldown;

    public ResultsScreen(GameRoot gameRoot, int score, RunConfig runConfig) {
        this.gameRoot = gameRoot;
        this.score = score;
    }

    @Override
    public void render(float delta) {
        cooldown += delta;
        Gdx.gl.glClearColor(0.05f, 0.06f, 0.09f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT | GL20.GL_DEPTH_BUFFER_BIT);
        resultsRenderer.render(score);

        if (cooldown > 0.35f && (Gdx.input.isKeyJustPressed(Input.Keys.ENTER) || Gdx.input.justTouched())) {
            gameRoot.showOverworld();
        }
    }

    @Override
    public void dispose() {
        resultsRenderer.dispose();
    }
}
