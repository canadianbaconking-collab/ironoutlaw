package com.frostedlogic.ironoutlaw.vehicle;

import com.badlogic.gdx.math.MathUtils;
import com.frostedlogic.ironoutlaw.gameplay.InputState;

public class VehicleController {
    public void update(VehicleModel model, InputState input, float dt) {
        float steer = MathUtils.clamp(input.steer, -1f, 1f);
        float throttle = MathUtils.clamp(input.throttle, -1f, 1f);
        model.headingRad += steer * model.steeringRate * dt;

        float forwardX = MathUtils.sin(model.headingRad);
        float forwardZ = MathUtils.cos(model.headingRad);
        float accelScale = 1f;
        if (input.nitro && model.nitroMeter > 0f) {
            accelScale = model.nitroMultiplier;
            model.nitroMeter = Math.max(0f, model.nitroMeter - model.nitroDrainRate * dt);
        } else {
            model.nitroMeter = Math.min(1f, model.nitroMeter + model.nitroRecoverRate * dt);
        }

        float accel = model.acceleration * throttle * accelScale;
        model.velocity.x += forwardX * accel * dt;
        model.velocity.z += forwardZ * accel * dt;

        float drag = input.brake ? model.brakeDrag : model.baseDrag;
        float horizontalSpeed = (float) Math.sqrt(model.velocity.x * model.velocity.x + model.velocity.z * model.velocity.z);
        if (horizontalSpeed > 0f) {
            float decel = Math.min(horizontalSpeed, drag * dt * (model.grounded ? 1f : 0.65f));
            float scale = (horizontalSpeed - decel) / horizontalSpeed;
            model.velocity.x *= scale;
            model.velocity.z *= scale;
        }

        if (model.grounded && input.jumpPressed) {
            model.velocity.y = model.jumpImpulse;
            model.grounded = false;
        }

        model.velocity.y -= model.gravity * dt;
        model.position.mulAdd(model.velocity, dt);

        if (model.position.y <= 0.5f) {
            model.position.y = 0.5f;
            model.velocity.y = 0f;
            model.grounded = true;
        }

        float clampedSpeed = Math.min(model.maxSpeed * accelScale, (float) Math.sqrt(model.velocity.x * model.velocity.x + model.velocity.z * model.velocity.z));
        if (horizontalSpeed > 0f && clampedSpeed < horizontalSpeed) {
            float speedScale = clampedSpeed / horizontalSpeed;
            model.velocity.x *= speedScale;
            model.velocity.z *= speedScale;
        }
    }
}
