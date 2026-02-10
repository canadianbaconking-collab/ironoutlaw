package com.frostedlogic.ironoutlaw.gameplay;

import com.badlogic.gdx.Game;
import com.frostedlogic.ironoutlaw.FirstScreen;

/**
 * GameRoot is the stable, minimal glue layer that owns screen routing.
 * Keep LibGDX platform glue in launchers; keep game logic outside.
 */
public class GameRoot extends Game {

    @Override
    public void create() {
        // Temporary: route to the existing screen. We'll replace this with IronOutlaw screens.
        setScreen(new FirstScreen());
    }
}
