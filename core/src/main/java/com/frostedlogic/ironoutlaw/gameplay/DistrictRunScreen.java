package com.frostedlogic.ironoutlaw.gameplay;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.ScreenAdapter;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.PerspectiveCamera;
import com.badlogic.gdx.graphics.VertexAttributes;
import com.badlogic.gdx.graphics.g3d.Environment;
import com.badlogic.gdx.graphics.g3d.Material;
import com.badlogic.gdx.graphics.g3d.Model;
import com.badlogic.gdx.graphics.g3d.ModelBatch;
import com.badlogic.gdx.graphics.g3d.ModelInstance;
import com.badlogic.gdx.graphics.g3d.attributes.ColorAttribute;
import com.badlogic.gdx.graphics.g3d.environment.DirectionalLight;
import com.badlogic.gdx.graphics.g3d.utils.ModelBuilder;
import com.badlogic.gdx.math.MathUtils;
import com.badlogic.gdx.math.Rectangle;
import com.badlogic.gdx.math.Vector3;
import com.badlogic.gdx.utils.Array;
import com.frostedlogic.ironoutlaw.audio.AudioBus;
import com.frostedlogic.ironoutlaw.destruction.DestructionSystem;
import com.frostedlogic.ironoutlaw.destruction.Smashable;
import com.frostedlogic.ironoutlaw.ui.HudRenderer;
import com.frostedlogic.ironoutlaw.ui.ToastQueue;
import com.frostedlogic.ironoutlaw.vehicle.VehicleController;
import com.frostedlogic.ironoutlaw.vehicle.VehicleModel;
import com.frostedlogic.ironoutlaw.world.DistrictGenerator;
import com.frostedlogic.ironoutlaw.world.DistrictLayout;

public class DistrictRunScreen extends ScreenAdapter {
    private static class SmashableRender {
        final Smashable smashable;
        final ModelInstance instance;

        SmashableRender(Smashable smashable, ModelInstance instance) {
            this.smashable = smashable;
            this.instance = instance;
        }
    }

    private final GameRoot gameRoot;
    private final RunConfig runConfig;
    private final RunState runState;
    private final FixedStepLoop fixedStepLoop = new FixedStepLoop();
    private final VehicleModel vehicle = new VehicleModel();
    private final VehicleController vehicleController = new VehicleController();
    private final InputState inputState = new InputState();
    private final AudioBus audioBus = new AudioBus();
    private final DestructionSystem destructionSystem = new DestructionSystem();
    private final ToastQueue toastQueue = new ToastQueue();
    private final HudRenderer hudRenderer = new HudRenderer();

    private final Array<SmashableRender> smashables = new Array<>();
    private final Array<Smashable> smashableState = new Array<>();
    private final Vector3 cameraTarget = new Vector3();
    private final Rectangle leftTouchZone = new Rectangle();
    private final Rectangle jumpTouchZone = new Rectangle();
    private final Rectangle nitroTouchZone = new Rectangle();

    private ModelBatch modelBatch;
    private Environment environment;
    private PerspectiveCamera camera;
    private Model vehicleModelMesh;
    private Model roadModelMesh;
    private Model residentialMesh;
    private Model commercialMesh;
    private ModelInstance vehicleInstance;
    private ModelInstance roadInstance;

    private boolean toast1;
    private boolean toast2;
    private boolean toast3;
    private boolean toast4;
    private boolean routedToResults;
    private float elapsedTime;

    public DistrictRunScreen(GameRoot gameRoot, RunConfig runConfig) {
        this.gameRoot = gameRoot;
        this.runConfig = runConfig;
        this.runState = new RunState(runConfig.durationSeconds);
    }

    @Override
    public void show() {
        modelBatch = new ModelBatch();
        environment = new Environment();
        environment.set(new ColorAttribute(ColorAttribute.AmbientLight, 0.75f, 0.75f, 0.75f, 1f));
        environment.add(new DirectionalLight().set(0.9f, 0.9f, 0.9f, -0.6f, -0.8f, -0.2f));

        ModelBuilder builder = new ModelBuilder();
        long attrs = VertexAttributes.Usage.Position | VertexAttributes.Usage.Normal;
        vehicleModelMesh = builder.createBox(1.4f, 1f, 2.2f, new Material(ColorAttribute.createDiffuse(0.2f, 0.25f, 0.32f, 1f)), attrs);
        roadModelMesh = builder.createBox(20f, 0.2f, 500f, new Material(ColorAttribute.createDiffuse(0.18f, 0.18f, 0.2f, 1f)), attrs);
        residentialMesh = builder.createBox(1f, 1f, 1f, new Material(ColorAttribute.createDiffuse(0.45f, 0.55f, 0.68f, 1f)), attrs);
        commercialMesh = builder.createBox(1f, 1f, 1f, new Material(ColorAttribute.createDiffuse(0.62f, 0.58f, 0.42f, 1f)), attrs);

        vehicleInstance = new ModelInstance(vehicleModelMesh);
        roadInstance = new ModelInstance(roadModelMesh);
        roadInstance.transform.setToTranslation(0f, -0.1f, 220f);

        camera = new PerspectiveCamera(67f, Gdx.graphics.getWidth(), Gdx.graphics.getHeight());
        camera.position.set(0f, 6f, -12f);
        camera.near = 0.1f;
        camera.far = 1200f;
        camera.lookAt(0f, 1f, 6f);
        camera.update();

        DistrictLayout layout = new DistrictGenerator().generate(runConfig.seed, 200);
        for (DistrictLayout.Spawn spawn : layout.spawns) {
            Smashable smashable = new Smashable(spawn.position, spawn.size, spawn.health, spawn.mass, spawn.zone);
            ModelInstance instance = new ModelInstance("commercial".equals(spawn.zone) ? commercialMesh : residentialMesh);
            instance.transform.setToTranslation(spawn.position);
            instance.transform.scale(spawn.size.x, spawn.size.y, spawn.size.z);
            smashables.add(new SmashableRender(smashable, instance));
            smashableState.add(smashable);
        }
    }

    @Override
    public void render(float delta) {
        fixedStepLoop.advance(delta, this::tick);
        updateCamera(delta);
        vehicleInstance.transform.setToTranslation(vehicle.position);
        vehicleInstance.transform.rotate(Vector3.Y, -MathUtils.radiansToDegrees * vehicle.headingRad);

        Gdx.gl.glViewport(0, 0, Gdx.graphics.getWidth(), Gdx.graphics.getHeight());
        Gdx.gl.glClearColor(0.06f, 0.07f, 0.1f, 1f);
        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT | GL20.GL_DEPTH_BUFFER_BIT);

        modelBatch.begin(camera);
        modelBatch.render(roadInstance, environment);
        modelBatch.render(vehicleInstance, environment);
        for (SmashableRender smashable : smashables) {
            modelBatch.render(smashable.instance, environment);
        }
        modelBatch.end();

        hudRenderer.render(runState, vehicle, toastQueue.currentText(), Gdx.app.getType().name().contains("Android"));
    }

    private void tick(float dt) {
        pollInput();
        vehicleController.update(vehicle, inputState, dt);
        if (inputState.jumpPressed) {
            runState.jumpedOnce = true;
        }

        DestructionSystem.ImpactResult impactResult = destructionSystem.resolve(vehicle, smashableState);
        if (impactResult.biggestImpact > 0f) {
            audioBus.playImpact(impactResult.biggestImpact);
        }
        if (impactResult.destroyedCount > 0) {
            audioBus.playExplosion(impactResult.destroyedCount);
        }
        runState.score += impactResult.scoreDelta;
        runState.destroyedCount += impactResult.destroyedCount;
        removeDestroyed();

        float horizontalSpeed = (float) Math.sqrt(vehicle.velocity.x * vehicle.velocity.x + vehicle.velocity.z * vehicle.velocity.z);
        audioBus.setEngineRpm(MathUtils.clamp(horizontalSpeed / vehicle.maxSpeed, 0f, 1f));

        runState.timeRemaining -= dt;
        elapsedTime += dt;
        updateToasts(dt);

        if (runState.isEnded() && !routedToResults) {
            routedToResults = true;
            gameRoot.showResults(runState.score, runConfig);
        }
    }

    private void pollInput() {
        inputState.steer = 0f;
        inputState.throttle = 0f;
        inputState.brake = false;
        inputState.nitro = false;
        inputState.jumpPressed = false;

        if (Gdx.input.isKeyPressed(Input.Keys.A) || Gdx.input.isKeyPressed(Input.Keys.LEFT)) {
            inputState.steer -= 1f;
        }
        if (Gdx.input.isKeyPressed(Input.Keys.D) || Gdx.input.isKeyPressed(Input.Keys.RIGHT)) {
            inputState.steer += 1f;
        }
        if (Gdx.input.isKeyPressed(Input.Keys.W) || Gdx.input.isKeyPressed(Input.Keys.UP)) {
            inputState.throttle = 1f;
        } else if (Gdx.input.isKeyPressed(Input.Keys.S) || Gdx.input.isKeyPressed(Input.Keys.DOWN)) {
            inputState.throttle = -0.5f;
        }
        inputState.brake = Gdx.input.isKeyPressed(Input.Keys.CONTROL_LEFT) || Gdx.input.isKeyPressed(Input.Keys.CONTROL_RIGHT);
        inputState.nitro = Gdx.input.isKeyPressed(Input.Keys.SHIFT_LEFT) || Gdx.input.isKeyPressed(Input.Keys.SHIFT_RIGHT);
        inputState.jumpPressed = Gdx.input.isKeyJustPressed(Input.Keys.SPACE);

        if (Gdx.app.getType().name().contains("Android")) {
            applyMobileTouchInput();
        }
    }

    private void applyMobileTouchInput() {
        int w = Gdx.graphics.getWidth();
        int h = Gdx.graphics.getHeight();
        leftTouchZone.set(0f, 0f, w * 0.5f, h);
        jumpTouchZone.set(w * 0.72f, 0f, w * 0.13f, h * 0.24f);
        nitroTouchZone.set(w * 0.86f, 0f, w * 0.13f, h * 0.24f);

        for (int i = 0; i < 5; i++) {
            if (!Gdx.input.isTouched(i)) {
                continue;
            }
            float x = Gdx.input.getX(i);
            float y = h - Gdx.input.getY(i);
            if (leftTouchZone.contains(x, y)) {
                inputState.throttle = 1f;
                inputState.steer = x < w * 0.25f ? -1f : 1f;
            } else if (jumpTouchZone.contains(x, y)) {
                inputState.jumpPressed = true;
            } else if (nitroTouchZone.contains(x, y)) {
                inputState.nitro = true;
            }
        }
    }

    private void updateToasts(float dt) {
        if (!toast1 && elapsedTime >= 1.5f) {
            toast1 = true;
            toastQueue.enqueue("SMASH TO MOVE", 2.5f);
        }
        if (!toast2 && (runState.score >= 60 || elapsedTime >= 8f)) {
            toast2 = true;
            toastQueue.enqueue("SPEED = POWER", 2.5f);
        }
        if (!toast3 && (runState.jumpedOnce || elapsedTime >= 20f)) {
            toast3 = true;
            toastQueue.enqueue("AIR BREAKS HARDER", 2.5f);
        }
        if (!toast4 && (runState.destroyedCount >= 3 || elapsedTime >= 35f)) {
            toast4 = true;
            toastQueue.enqueue("CHAIN THE DAMAGE", 2.5f);
        }
        toastQueue.update(dt);
    }

    private void removeDestroyed() {
        for (int i = smashables.size - 1; i >= 0; i--) {
            if (smashables.get(i).smashable.destroyed) {
                smashableState.removeValue(smashables.get(i).smashable, true);
                smashables.removeIndex(i);
            }
        }
    }

    private void updateCamera(float delta) {
        cameraTarget.set(vehicle.position.x, vehicle.position.y + 3.5f, vehicle.position.z - 10f);
        float alpha = 1f - (float) Math.exp(-6f * Math.min(delta, 1f / 15f));
        camera.position.lerp(cameraTarget, alpha);
        camera.lookAt(vehicle.position.x, vehicle.position.y + 1.5f, vehicle.position.z + 6f);
        camera.up.set(Vector3.Y);
        camera.update();
    }

    @Override
    public void resize(int width, int height) {
        if (camera != null && width > 0 && height > 0) {
            camera.viewportWidth = width;
            camera.viewportHeight = height;
            camera.update();
        }
    }

    @Override
    public void dispose() {
        if (modelBatch != null) {
            modelBatch.dispose();
        }
        if (vehicleModelMesh != null) {
            vehicleModelMesh.dispose();
        }
        if (roadModelMesh != null) {
            roadModelMesh.dispose();
        }
        if (residentialMesh != null) {
            residentialMesh.dispose();
        }
        if (commercialMesh != null) {
            commercialMesh.dispose();
        }
        hudRenderer.dispose();
    }
}
