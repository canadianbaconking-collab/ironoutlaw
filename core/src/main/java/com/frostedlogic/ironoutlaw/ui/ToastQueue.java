package com.frostedlogic.ironoutlaw.ui;

import com.badlogic.gdx.utils.Array;

public class ToastQueue {
    private static class Toast {
        final String text;
        final float duration;

        Toast(String text, float duration) {
            this.text = text;
            this.duration = duration;
        }
    }

    private final Array<Toast> queue = new Array<>();
    private Toast active;
    private float activeTime;

    public void enqueue(String text, float duration) {
        queue.add(new Toast(text, duration));
    }

    public void update(float dt) {
        if (active == null && queue.notEmpty()) {
            active = queue.removeIndex(0);
            activeTime = active.duration;
        }
        if (active != null) {
            activeTime -= dt;
            if (activeTime <= 0f) {
                active = null;
            }
        }
    }

    public String currentText() {
        return active == null ? null : active.text;
    }
}
