// ============================================================
// PANCAKE PLOP! — PANCAKE MATERIAL
// Data model for the pancake's visual/material state
// ============================================================
//
// Master Spec §5 ("Pancake Material") and §63 (CREATE list) call
// for a layered material system — browning, moisture, gloss,
// damage, butter/syrup coverage — as independent DATA that the
// renderer interprets, rather than hardcoded into drawing code.
//
// This file owns that data. It is not physics, not gameplay
// state (Pancake), and not drawing code (PancakePresentation) —
// it sits between them, the same way the Master Spec's own
// architecture diagram (§73) shows PHYSICS → GAMEPLAY EVENTS →
// PRESENTATION LAYER → MATERIALS.
//
// Today only `browning` (with spatial variation via
// `browningSpots`) is actually driven by anything meaningful —
// it's seeded per level for subtle pancake-to-pancake variation
// (Master Spec §4: "different pancakes may have subtle
// procedural variation, but every variation belongs to the same
// visual family"). heat/damage/butterCoverage/syrupCoverage
// exist as real fields with sensible defaults, ready for future
// gameplay events (burning, hard impacts, the existing butter/
// syrup obstacles) to drive — they are not wired to anything
// yet, which is stated explicitly rather than left to be
// discovered by reading code.
// ============================================================

const PancakeMaterial = {

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    /*
     * 0 = raw, 1 = fully golden-brown. Spatial variation lives
     * in browningSpots below — this is the overall/base level.
     * Not yet wired to any gameplay event (e.g. time-on-griddle);
     * starts at a fixed "lightly cooked" default.
     */
    browning: 0.35,

    /*
     * 0-1. Reserved for future heat-haze/steam intensity tied to
     * proximity to the griddle. Not yet read anywhere.
     */
    heat: 0,

    /*
     * 0-1. Affects highlight/gloss strength in
     * PancakePresentation's shading layers.
     */
    moisture: 0.55,

    gloss: 0.35,

    /*
     * 0-1. Reserved for future persistent visual imperfections
     * from hard impacts (Master Spec §19). Not yet wired to
     * collision events.
     */
    damage: 0,

    /*
     * 0-1. Reserved for a future melted-butter trace overlay
     * when the pancake contacts a butter obstacle. Not yet
     * wired to Pancake's 'land' presentation event.
     */
    butterCoverage: 0,

    /*
     * 0-1. Reserved for a future syrup overlay. Not yet wired
     * to anything.
     */
    syrupCoverage: 0,

    /*
     * Procedurally-placed browning blotches, in the pancake's
     * local drawing space (same origin/orientation as the
     * physics body — 0,0 = centre). Each: { x, y, radiusX,
     * radiusY, rotation, intensity }. Regenerated once per
     * level via init() so a level's pancake looks consistent
     * across every flip within that level, not different every
     * frame.
     */
    browningSpots: [],

    initialized: false,

    // --------------------------------------------------------
    // SEEDED RANDOM
    // --------------------------------------------------------

    /*
     * Small deterministic PRNG (Park-Miller) so a given seed
     * always produces the same spot layout — lets the same
     * level look the same pancake every time, while different
     * levels/restarts can look subtly different.
     */
    _makeRandom(seed) {

        let state =
            (seed % 2147483647) || 1;

        if (state <= 0) {
            state += 2147483646;
        }

        return () => {

            state =
                (state * 16807) % 2147483647;

            return (state - 1) / 2147483646;
        };
    },

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init(seed) {

        this.browning = 0.35;
        this.heat = 0;
        this.moisture = 0.55;
        this.gloss = 0.35;
        this.damage = 0;
        this.butterCoverage = 0;
        this.syrupCoverage = 0;

        this.generateBrowningSpots(
            seed
        );

        this.initialized = true;
    },

    // --------------------------------------------------------
    // GENERATE BROWNING SPOTS
    // --------------------------------------------------------

    generateBrowningSpots(seed) {

        const resolvedSeed =
            (typeof seed === 'number' && !Number.isNaN(seed))
                ? seed
                : Date.now() % 100000;

        const random =
            this._makeRandom(
                resolvedSeed
            );

        const spotCount =
            6 + Math.floor(
                random() * 3
            );

        const halfWidth =
            CONFIG.pancake.width / 2;

        const halfHeight =
            CONFIG.pancake.height / 2;

        this.browningSpots = [];

        for (let i = 0; i < spotCount; i++) {

            this.browningSpots.push({

                x:
                    (random() - 0.5) *
                    halfWidth * 1.5,

                y:
                    (random() - 0.5) *
                    halfHeight * 1.3,

                radiusX:
                    1.6 + random() * 3,

                radiusY:
                    1 + random() * 1.8,

                rotation:
                    random() * Math.PI,

                intensity:
                    0.4 + random() * 0.5
            });
        }
    }
};

window.PancakeMaterial = PancakeMaterial;
