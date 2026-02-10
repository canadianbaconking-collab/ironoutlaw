package com.frostedlogic.ironoutlaw.world;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DistrictGeneratorDeterminismTest {
    @Test
    void generatesSameLayoutForSameSeed() {
        DistrictGenerator generator = new DistrictGenerator();
        DistrictLayout first = generator.generate(12345L, 200);
        DistrictLayout second = generator.generate(12345L, 200);

        assertEquals(first.spawns.size, second.spawns.size);
        for (int i = 0; i < first.spawns.size; i++) {
            DistrictLayout.Spawn a = first.spawns.get(i);
            DistrictLayout.Spawn b = second.spawns.get(i);
            assertEquals(a.position.x, b.position.x, 0.00001f);
            assertEquals(a.position.y, b.position.y, 0.00001f);
            assertEquals(a.position.z, b.position.z, 0.00001f);
            assertEquals(a.size.x, b.size.x, 0.00001f);
            assertEquals(a.size.y, b.size.y, 0.00001f);
            assertEquals(a.size.z, b.size.z, 0.00001f);
            assertEquals(a.health, b.health, 0.00001f);
            assertEquals(a.mass, b.mass, 0.00001f);
            assertEquals(a.zone, b.zone);
        }
    }
}
