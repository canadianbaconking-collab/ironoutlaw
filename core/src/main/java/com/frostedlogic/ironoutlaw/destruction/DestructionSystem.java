package com.frostedlogic.ironoutlaw.destruction;

import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.utils.Array;
import com.frostedlogic.ironoutlaw.vehicle.VehicleModel;

public class DestructionSystem {
    public static class ImpactResult {
        public int scoreDelta;
        public int destroyedCount;
        public float biggestImpact;
    }

    private final float impactThreshold = 6.5f;

    public ImpactResult resolve(VehicleModel vehicle, Array<Smashable> smashables) {
        ImpactResult result = new ImpactResult();
        float speed = horizontalSpeed(vehicle.velocity);
        if (speed <= 0.2f) {
            return result;
        }

        for (Smashable smashable : smashables) {
            if (smashable.destroyed || !intersects(vehicle, smashable)) {
                continue;
            }
            float impact = speed * (1.1f + smashable.mass * 0.03f);
            if (impact < impactThreshold) {
                continue;
            }
            result.biggestImpact = Math.max(result.biggestImpact, impact);
            float damage = (impact - impactThreshold) * 0.75f;
            float applied = Math.min(damage, smashable.health);
            smashable.health -= damage;
            result.scoreDelta += Math.max(1, (int) (applied * 2f));
            if (smashable.health <= 0f) {
                smashable.destroyed = true;
                result.destroyedCount++;
                result.scoreDelta += 50;
            }
        }
        return result;
    }

    private boolean intersects(VehicleModel vehicle, Smashable smashable) {
        float halfW = smashable.size.x * 0.5f + vehicle.collisionRadius;
        float halfH = smashable.size.y * 0.5f + vehicle.collisionRadius;
        float halfD = smashable.size.z * 0.5f + vehicle.collisionRadius;
        return Math.abs(vehicle.position.x - smashable.position.x) <= halfW
                && Math.abs(vehicle.position.y - smashable.position.y) <= halfH
                && Math.abs(vehicle.position.z - smashable.position.z) <= halfD;
    }

    private float horizontalSpeed(Vector3 velocity) {
        return (float) Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    }
}
