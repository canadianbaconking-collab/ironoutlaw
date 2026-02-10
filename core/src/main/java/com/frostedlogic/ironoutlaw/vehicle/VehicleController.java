package com.frostedlogic.ironoutlaw.vehicle;

import com.badlogic.gdx.math.MathUtils;
import com.frostedlogic.ironoutlaw.gameplay.InputState;

public class VehicleController {
    public void update(VehicleModel model, InputState input, float dt) {
        float steer = MathUtils.clamp(input.steer, -1f, 1f);
        float throttle = MathUtils.clamp(input.throttle, -1f, 1f);

        // Current speed (horizontal)
        float speed = (float) Math.sqrt(model.velocity.x * model.velocity.x + model.velocity.z * model.velocity.z);
        float speedNorm = model.maxSpeed <= 0f ? 0f : MathUtils.clamp(speed / model.maxSpeed, 0f, 1f);

        // Steering scales down at high speed to reduce twitch.
        // At low speed: ~100% steering. At high speed: ~35% steering.
        float steeringScale = MathUtils.lerp(1.0f, 0.35f, speedNorm);
        model.headingRad += steer * model.steeringRate * steeringScale * dt;

        float forwardX = MathUtils.sin(model.headingRad);
        float forwardZ = MathUtils.cos(model.headingRad);

        // Nitro: boost accel and raise allowed top speed while draining meter
        float accelScale = 1f;
        float topSpeedScale = 1f;
        if (input.nitro && model.nitroMeter > 0f) {
            accelScale = model.nitroMultiplier;
            topSpeedScale = MathUtils.lerp(1f, model.nitroMultiplier, 0.65f); // less than full multiplier to keep sane
            model.nitroMeter = Math.max(0f, model.nitroMeter - model.nitroDrainRate * dt);
        } else {
            model.nitroMeter = Math.min(1f, model.nitroMeter + model.nitroRecoverRate * dt);
        }

        // Acceleration
        float accel = model.acceleration * throttle * accelScale;
        model.velocity.x += forwardX * accel * dt;
        model.velocity.z += forwardZ * accel * dt;

        // Drag (slightly stronger at higher speed to keep stability)
        float drag = input.brake ? model.brakeDrag : model.baseDrag;
        float postAccelSpeed = (float) Math.sqrt(model.velocity.x * model.velocity.x + model.velocity.z * model.velocity.z);
        float dragBoost = MathUtils.lerp(1.0f, 1.35f, MathUtils.clamp(postAccelSpeed / Math.max(0.001f, model.maxSpeed), 0f, 1f));
        float effectiveDrag = drag * dragBoost;

        if (postAccelSpeed > 0f) {
            float decel = Math.min(postAccelSpeed, effectiveDrag * dt * (model.grounded ? 1f : 0.65f));
            float scale = (postAccelSpeed - decel) / postAccelSpeed;
            model.velocity.x *= scale;
            model.velocity.z *= scale;
        }

        // Jump
        if (model.grounded && input.jumpPressed) {
            model.velocity.y = model.jumpImpulse;
            model.grounded = false;
        }

        // Gravity + integrate
        model.velocity.y -= model.gravity * dt;
        model.position.mulAdd(model.velocity, dt);

        // Ground plane
        if (model.position.y <= 0.5f) {
            model.position.y = 0.5f;
            model.velocity.y = 0f;
            model.grounded = true;
        }

        // Clamp speed AFTER all changes, using updated speed
        float finalSpeed = (float) Math.sqrt(model.velocity.x * model.velocity.x + model.velocity.z * model.velocity.z);
        float maxAllowed = model.maxSpeed * topSpeedScale;
        if (finalSpeed > maxAllowed && finalSpeed > 0f) {
            float s = maxAllowed / finalSpeed;
            model.velocity.x *= s;
            model.velocity.z *= s;
        }
    }
}
