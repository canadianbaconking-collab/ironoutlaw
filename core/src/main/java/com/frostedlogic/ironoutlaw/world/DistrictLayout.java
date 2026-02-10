package com.frostedlogic.ironoutlaw.world;

import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.utils.Array;

public class DistrictLayout {
    public static class Spawn {
        public final Vector3 position;
        public final Vector3 size;
        public final float health;
        public final float mass;
        public final String zone;

        public Spawn(Vector3 position, Vector3 size, float health, float mass, String zone) {
            this.position = position;
            this.size = size;
            this.health = health;
            this.mass = mass;
            this.zone = zone;
        }
    }

    public final Array<Spawn> spawns = new Array<>();
}
