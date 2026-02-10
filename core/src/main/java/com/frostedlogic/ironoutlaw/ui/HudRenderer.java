package com.frostedlogic.ironoutlaw.ui;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.glutils.ShapeRenderer;
import com.frostedlogic.ironoutlaw.gameplay.RunState;
import com.frostedlogic.ironoutlaw.vehicle.VehicleModel;

public class HudRenderer {
    private final SpriteBatch batch = new SpriteBatch();
    private final BitmapFont font = new BitmapFont();
    private final ShapeRenderer shapeRenderer = new ShapeRenderer();

    public void render(RunState runState, VehicleModel vehicle, String toastText, boolean mobileControlsHint) {
        float width = Gdx.graphics.getWidth();
        float height = Gdx.graphics.getHeight();

        shapeRenderer.begin(ShapeRenderer.ShapeType.Filled);
        shapeRenderer.setColor(0.1f, 0.1f, 0.1f, 0.75f);
        shapeRenderer.rect(12f, height - 52f, 200f, 40f);
        shapeRenderer.rect(width - 222f, height - 52f, 210f, 40f);
        shapeRenderer.setColor(0.15f, 0.15f, 0.15f, 0.85f);
        shapeRenderer.rect(width * 0.5f - 70f, height - 30f, 140f, 14f);
        shapeRenderer.setColor(0.95f, 0.72f, 0.2f, 0.95f);
        shapeRenderer.rect(width * 0.5f - 70f, height - 30f, 140f * vehicle.nitroMeter, 14f);
        shapeRenderer.end();

        batch.begin();
        font.setColor(Color.WHITE);
        font.draw(batch, "TIME " + Math.max(0, (int) Math.ceil(runState.timeRemaining)), 20f, height - 25f);
        font.draw(batch, "SCORE " + runState.score, width - 210f, height - 25f);
        font.draw(batch, "NITRO", width * 0.5f - 18f, height - 14f);
        if (toastText != null) {
            font.getData().setScale(1.15f);
            font.draw(batch, toastText, width * 0.5f - 80f, 58f);
            font.getData().setScale(1f);
        }
        if (mobileControlsHint) {
            font.draw(batch, "TOUCH LEFT/RIGHT TO STEER | BOTTOM RIGHT: JUMP/NITRO", 12f, 24f);
        }
        batch.end();
    }

    public void dispose() {
        batch.dispose();
        font.dispose();
        shapeRenderer.dispose();
    }
}
