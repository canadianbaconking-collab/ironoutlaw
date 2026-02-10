package com.frostedlogic.ironoutlaw.vehicle;

import com.frostedlogic.ironoutlaw.gameplay.InputState;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class VehicleControllerDeterminismTest {
    @Test
    void deterministicScriptedInputEndsAtExpectedPosition() {
        VehicleModel vehicle = new VehicleModel();
        VehicleController controller = new VehicleController();
        InputState inputState = new InputState();
        float dt = 1f / 60f;

        for (int tick = 0; tick < 180; tick++) {
            inputState.throttle = tick < 120 ? 1f : 0f;
            inputState.steer = tick < 60 ? 0.2f : 0f;
            inputState.jumpPressed = tick == 30;
            inputState.nitro = tick >= 70 && tick <= 90;
            inputState.brake = false;
            controller.update(vehicle, inputState, dt);
        }

        assertEquals(19.43107f, vehicle.position.x, 0.0002f);
        assertEquals(0.5f, vehicle.position.y, 0.0001f);
        assertEquals(72.18272f, vehicle.position.z, 0.0002f);
    }
}
