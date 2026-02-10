package com.frostedlogic.ironoutlaw.world;

import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.RandomXS128;
import com.badlogic.gdx.math.Vector3;

public class DistrictGenerator {
    public DistrictLayout generate(long seed, int maxSmashables) {
        DistrictLayout layout = new DistrictLayout();
        RandomXS128 rng = new RandomXS128(seed);
        float z = 8f;
        int guard = 0;

        while (layout.spawns.size < maxSmashables && guard < 2000) {
            boolean residential = z < 180f;
            String zone = residential ? "residential" : "commercial";
            int clusterDepth = residential ? 2 + rng.nextInt(2) : 2 + rng.nextInt(3);
            float laneOffset = residential ? 9f : 11f;
            float widthMin = residential ? 1.2f : 1.8f;
            float widthMax = residential ? 2.4f : 3.2f;
            float heightMin = residential ? 1.6f : 2.8f;
            float heightMax = residential ? 3.4f : 6.2f;

            for (int side = -1; side <= 1; side += 2) {
                for (int i = 0; i < clusterDepth && layout.spawns.size < maxSmashables; i++) {
                    float localZ = z + i * 3.2f + rng.nextFloat() * 0.9f;
                    float x = side * (laneOffset + rng.nextFloat() * 3f);
                    float w = MathUtils.lerp(widthMin, widthMax, rng.nextFloat());
                    float h = MathUtils.lerp(heightMin, heightMax, rng.nextFloat());
                    float d = MathUtils.lerp(widthMin, widthMax, rng.nextFloat());
                    float health = residential ? 12f + h * 3f : 22f + h * 4f;
                    float mass = residential ? 8f + h * 2f : 14f + h * 3f;
                    layout.spawns.add(new DistrictLayout.Spawn(
                            new Vector3(x, h * 0.5f, localZ),
                            new Vector3(w, h, d),
                            health,
                            mass,
                            zone
                    ));
                }
            }

            z += residential ? 8f + rng.nextFloat() * 3f : 10f + rng.nextFloat() * 4f;
            guard++;
        }

        return layout;
    }
}
