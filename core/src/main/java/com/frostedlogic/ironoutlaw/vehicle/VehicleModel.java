package com.frostedlogic.ironoutlaw.vehicle;

import com.badlogic.gdx.math.Vector3;

public class VehicleModel {
    public final Vector3 position = new Vector3(0f, 0.5f, 0f);
    public final Vector3 velocity = new Vector3();

    public float headingRad = 0f;
    public boolean grounded = true;
    public float nitroMeter = 1f;

    public float acceleration = 24f;
    public float steeringRate = 1.8f;
    public float baseDrag = 2.0f;
    public float brakeDrag = 6.0f;
    public float maxSpeed = 35f;
    public float nitroMultiplier = 1.65f;
    public float nitroDrainRate = 0.45f;
    public float nitroRecoverRate = 0.18f;
    public float jumpImpulse = 8.0f;
    public float gravity = 24f;
    public float collisionRadius = 0.9f;
}
