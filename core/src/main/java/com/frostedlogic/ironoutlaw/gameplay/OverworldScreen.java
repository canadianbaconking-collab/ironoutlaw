package com.frostedlogic.ironoutlaw.gameplay;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.glutils.ShapeRenderer;
import com.badlogic.gdx.math.Rectangle;

public class OverworldScreen extends ScreenAdapter {
    private final GameRoot gameRoot;
    private final SpriteBatch batch = new SpriteBatch();
    private final BitmapFont font = new BitmapFont();
    private final ShapeRenderer shapeRenderer = new ShapeRenderer();

    public OverworldScreen(GameRoot gameRoot) {
        this.gameRoot = gameRoot;
    }

    @Override
    public void render(float delta) {
        float w = Gdx.graphics.getWidth();
        float h = Gdx.graphics.getHeight();
        Rectangle districtButton = new Rectangle(w * 0.38f, h * 0.2f, w * 0.24f, h * 0.12f);

        Gdx.gl.glClearColor(0.04f, 0.05f, 0.09f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT | GL20.GL_DEPTH_BUFFER_BIT);

        shapeRenderer.begin(ShapeRenderer.ShapeType.Filled);
        shapeRenderer.setColor(0.1f, 0.2f, 0.35f, 1f);
        shapeRenderer.circle(w * 0.5f, h * 0.62f, Math.min(w, h) * 0.2f);
        shapeRenderer.setColor(0.18f, 0.26f, 0.42f, 1f);
        shapeRenderer.rect(districtButton.x, districtButton.y, districtButton.width, districtButton.height);
        shapeRenderer.end();

        batch.begin();
        font.getData().setScale(1.6f);
        font.draw(batch, "THE IRON OUTLAW", w * 0.5f - 150f, h * 0.9f);
        font.getData().setScale(1f);
        font.draw(batch, "Overworld Stub - District 01", w * 0.5f - 95f, h * 0.73f);
        font.draw(batch, "START DISTRICT", districtButton.x + 26f, districtButton.y + districtButton.height * 0.63f);
        font.draw(batch, "Press ENTER or Tap the button", w * 0.5f - 100f, h * 0.12f);
        batch.end();

        if (Gdx.input.isKeyJustPressed(Input.Keys.ENTER)) {
            gameRoot.startRun(new RunConfig(75, 12345L, 1));
            return;
        }
        if (Gdx.input.justTouched()) {
            float x = Gdx.input.getX();
            float y = h - Gdx.input.getY();
            if (districtButton.contains(x, y)) {
                gameRoot.startRun(new RunConfig(75, 12345L, 1));
            }
        }
    }

    @Override
    public void dispose() {
        batch.dispose();
        font.dispose();
        shapeRenderer.dispose();
    }
}
