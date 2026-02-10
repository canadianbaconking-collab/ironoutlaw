package com.frostedlogic.ironoutlaw.destruction;

import com.badlogic.gdx.math.Vector3;

public class Smashable {
    public final Vector3 position;
    public final Vector3 size;
    public float health;
    public final float mass;
    public boolean destroyed;
    public final String zone;

    public Smashable(Vector3 position, Vector3 size, float health, float mass, String zone) {
        this.position = new Vector3(position);
        this.size = new Vector3(size);
        this.health = health;
        this.mass = mass;
        this.zone = zone;
    }
}
