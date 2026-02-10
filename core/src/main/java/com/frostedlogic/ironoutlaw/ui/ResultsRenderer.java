package com.frostedlogic.ironoutlaw.ui;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

public class ResultsRenderer {
    private final SpriteBatch batch = new SpriteBatch();
    private final BitmapFont font = new BitmapFont();

    public void render(int score) {
        float width = Gdx.graphics.getWidth();
        float height = Gdx.graphics.getHeight();
        batch.begin();
        font.getData().setScale(1.8f);
        font.setColor(Color.WHITE);
        font.draw(batch, "DISTRICT RESULTS", width * 0.5f - 170f, height * 0.65f);
        font.getData().setScale(1.3f);
        font.draw(batch, "Score: " + score, width * 0.5f - 70f, height * 0.52f);
        font.getData().setScale(1f);
        font.draw(batch, "Press ENTER or TAP to continue", width * 0.5f - 130f, height * 0.4f);
        batch.end();
    }

    public void dispose() {
        batch.dispose();
        font.dispose();
    }
}
