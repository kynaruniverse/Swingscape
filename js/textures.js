// ============================================================
// PANCAKE PLOP! — TEXTURES
// Canvas-generated PIXI textures (real gradients for PixiJS v7)
// ============================================================
//
// Audit finding: environment.js contains a comment stating
// gradients are skipped because "PixiJS v7 does not have
// PIXI.FillGradient" — that's true (FillGradient is a v8
// addition) but incomplete: v7 can still produce real gradients
// by drawing one onto an offscreen <canvas> with the standard
// Canvas 2D API, then wrapping it as a PIXI.Texture via
// PIXI.Texture.from(canvas). No network, no asset files, no v8
// dependency — just the browser's own canvas API.
//
// This file provides that as reusable, generic infrastructure.
// It is NOT wired into the pancake or environment yet — see the
// comment in PancakePresentation.drawPancakeGraphics() for why
// the hero asset uses the simpler layered-shape technique for
// now (matrix alignment on a rotating body is easy to get subtly
// wrong, and it can't be visually verified in this environment).
// A static, non-rotating target (e.g. the countertop, or the
// background wash) is the lower-risk place to try this next,
// once it's been visually checked in an actual browser.
//
// Usage once adopted:
//
//   const texture = Textures.radialGradient({
//       width: 64, height: 64,
//       innerColor: '#f0c080', outerColor: '#d4903b'
//   });
//   graphics.beginTextureFill({ texture });
//   graphics.drawRect(-32, -32, 64, 64);
//   graphics.endFill();
//
// Textures are cached by their options so repeated calls with
// the same parameters don't regenerate a canvas every frame.
// ============================================================

const Textures = {

    _cache: {},

    // --------------------------------------------------------
    // RADIAL GRADIENT
    // --------------------------------------------------------

    /*
     * Soft centre-to-edge gradient — good for a rounded
     * highlight, a soft glow, or dome-like shading on a
     * roughly-circular/elliptical shape.
     */
    radialGradient(options) {

        const width =
            options.width || 64;

        const height =
            options.height || 64;

        const innerColor =
            options.innerColor || '#ffffff';

        const outerColor =
            options.outerColor || '#000000';

        const innerAlpha =
            (typeof options.innerAlpha === 'number')
                ? options.innerAlpha
                : 1;

        const outerAlpha =
            (typeof options.outerAlpha === 'number')
                ? options.outerAlpha
                : 0;

        const cacheKey =
            'radial:' +
            [
                width,
                height,
                innerColor,
                outerColor,
                innerAlpha,
                outerAlpha
            ].join(',');

        if (this._cache[cacheKey]) {
            return this._cache[cacheKey];
        }

        const canvas =
            document.createElement(
                'canvas'
            );

        canvas.width = width;
        canvas.height = height;

        const ctx =
            canvas.getContext('2d');

        const gradient =
            ctx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                Math.max(width, height) / 2
            );

        gradient.addColorStop(
            0,
            this._rgba(
                innerColor,
                innerAlpha
            )
        );

        gradient.addColorStop(
            1,
            this._rgba(
                outerColor,
                outerAlpha
            )
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        const texture =
            PIXI.Texture.from(
                canvas
            );

        this._cache[cacheKey] =
            texture;

        return texture;
    },

    // --------------------------------------------------------
    // LINEAR GRADIENT
    // --------------------------------------------------------

    /*
     * Top-to-bottom (or angle-specified) gradient — good for a
     * wall wash, a countertop edge, or any flat panel that wants
     * subtle depth without a full material system.
     */
    linearGradient(options) {

        const width =
            options.width || 64;

        const height =
            options.height || 64;

        const topColor =
            options.topColor || '#ffffff';

        const bottomColor =
            options.bottomColor || '#000000';

        const topAlpha =
            (typeof options.topAlpha === 'number')
                ? options.topAlpha
                : 1;

        const bottomAlpha =
            (typeof options.bottomAlpha === 'number')
                ? options.bottomAlpha
                : 1;

        const cacheKey =
            'linear:' +
            [
                width,
                height,
                topColor,
                bottomColor,
                topAlpha,
                bottomAlpha
            ].join(',');

        if (this._cache[cacheKey]) {
            return this._cache[cacheKey];
        }

        const canvas =
            document.createElement(
                'canvas'
            );

        canvas.width = width;
        canvas.height = height;

        const ctx =
            canvas.getContext('2d');

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );

        gradient.addColorStop(
            0,
            this._rgba(
                topColor,
                topAlpha
            )
        );

        gradient.addColorStop(
            1,
            this._rgba(
                bottomColor,
                bottomAlpha
            )
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        const texture =
            PIXI.Texture.from(
                canvas
            );

        this._cache[cacheKey] =
            texture;

        return texture;
    },

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------

    /*
     * Accepts '#rrggbb' or a 0xRRGGBB-style number and returns
     * an 'rgba(r,g,b,a)' string for use as a canvas fillStyle /
     * gradient stop.
     */
    _rgba(color, alpha) {

        let hex =
            color;

        if (typeof color === 'number') {

            hex =
                '#' +
                color
                    .toString(16)
                    .padStart(6, '0');
        }

        hex =
            hex.replace('#', '');

        const r =
            parseInt(
                hex.substring(0, 2),
                16
            );

        const g =
            parseInt(
                hex.substring(2, 4),
                16
            );

        const b =
            parseInt(
                hex.substring(4, 6),
                16
            );

        return (
            'rgba(' +
            r + ',' +
            g + ',' +
            b + ',' +
            alpha +
            ')'
        );
    },

    // --------------------------------------------------------
    // CLEAR CACHE
    // --------------------------------------------------------

    /*
     * Not currently called anywhere — provided for completeness
     * if a future pass needs to regenerate textures (e.g. after
     * a palette change during development).
     */
    clearCache() {

        Object.values(
            this._cache
        ).forEach(texture => {

            if (texture && texture.destroy) {
                texture.destroy(true);
            }
        });

        this._cache = {};
    }
};

window.Textures = Textures;
