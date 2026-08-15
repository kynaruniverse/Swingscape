// ============================================================
// PANCAKE PLOP! — CAMERA
// Transform applied to Renderer.worldContainer only
// ============================================================
//
// Architecture (audit item: camera transform layer).
//
// Master Spec §30–31 describes a portrait-first, three-quarter,
// mostly-stable camera that tracks the pancake, anticipates
// launches, and widens at high speed — but "almost never
// rotates" and must never obscure gameplay or touch input.
//
// None of that behaviour is implemented yet. This file exists
// so that work has a single, correct place to live: Camera is
// currently a pure identity transform (x=0, y=0, zoom=1,
// rotation=0), which produces ZERO visual change from the
// previous hard-locked stage. Every other presentation system
// (environment parallax, danger-zone overlay, future VFX) can
// now be built against Camera existing, rather than needing a
// structural change later when tracking/zoom is added.
//
// `ui` (the Pixi UI layer, not the DOM UI) intentionally is
// NOT transformed by Camera — it stays fixed to the screen
// regardless of camera movement. See Renderer.worldContainer.
// ============================================================

const Camera = {

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    /*
     * World-space point the camera is centred on, in the same
     * logical coordinate space as physics/gameplay (0,0 = no
     * offset from the default framing).
     */
    x: 0,
    y: 0,

    /*
     * 1 = no zoom. >1 = zoomed in. <1 = zoomed out (wider view).
     */
    zoom: 1,

    /*
     * Master Spec §31: the camera "almost never rotates".
     * Present for completeness, not expected to be animated.
     */
    rotation: 0,

    initialized: false,

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        this.reset();

        this.initialized = true;

        console.log(
            'Camera initialized (identity transform).'
        );
    },

    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    reset() {

        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.rotation = 0;
    },

    // --------------------------------------------------------
    // APPLY
    // --------------------------------------------------------

    /*
     * Called once per rendered frame from Game.renderUpdate(),
     * after presentation systems have updated world-space
     * positions and before Pixi's own ticker renders the frame.
     *
     * With the current identity state (0, 0, zoom 1, rotation 0)
     * this always resolves to position (0,0), scale (1,1),
     * rotation 0 — i.e. exactly what Renderer.worldContainer
     * already had before Camera existed.
     */
    apply() {

        const world =
            (typeof Renderer !== 'undefined')
                ? Renderer.worldContainer
                : null;

        if (!world) {
            return;
        }

        world.scale.set(
            this.zoom,
            this.zoom
        );

        world.position.set(
            -this.x * this.zoom,
            -this.y * this.zoom
        );

        world.rotation =
            this.rotation;
    }
};

window.Camera = Camera;
