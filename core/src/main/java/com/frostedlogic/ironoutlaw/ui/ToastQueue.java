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

    // New: time that must elapse between toasts (prevents rapid-fire spam)
    private float gapSeconds = 0.0f;
    private float gapRemaining = 0.0f;

    /** Sets the enforced gap between toasts (in seconds). */
    public void setGapSeconds(float gapSeconds) {
        this.gapSeconds = Math.max(0f, gapSeconds);
    }

    public void enqueue(String text, float duration) {
        queue.add(new Toast(text, duration));
    }

    public void update(float dt) {
        // Count down gap time if no toast active
        if (active == null && gapRemaining > 0f) {
            gapRemaining -= dt;
        }

        // Start a new toast only if we're not in a gap
        if (active == null && gapRemaining <= 0f && queue.notEmpty()) {
            active = queue.removeIndex(0);
            activeTime = active.duration;
        }

        if (active != null) {
            activeTime -= dt;
            if (activeTime <= 0f) {
                active = null;
                gapRemaining = gapSeconds; // enforce a gap before the next toast
            }
        }
    }

    public String currentText() {
        return active == null ? null : active.text;
    }
}
