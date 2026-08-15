// ============================================================
// PANCAKE PLOP! — PRESENTATION EVENTS
// Minimal pub/sub bus between gameplay and presentation
// ============================================================
//
// Architecture split (audit step 3):
//
//   Gameplay (Pancake, Obstacles, ...) emits events describing
//   what physically happened — it does not know or care who
//   is listening or how they react.
//
//   Presentation systems (Particles, AudioManager, UI,
//   PancakePresentation, ...) subscribe to the events they
//   care about and decide for themselves whether/how to react.
//
// This keeps gameplay code free of direct calls into specific
// presentation systems, per the Master Specification's
// event-driven presentation requirement (§35, §65).
//
// Event names follow the Master Specification's vocabulary:
// "launch", "impact", "bounce", "land", "burn", "success",
// "failure". Only "launch" and "land" are emitted today —
// the rest are reserved for future presentation work.
//
// Must load BEFORE any file that subscribes to events at
// load time (audio.js, particles.js, ui.js,
// pancake-presentation.js all subscribe immediately after
// defining their singleton, not inside init()).
// ============================================================

const PresentationEvents = {

    listeners: {},

    // --------------------------------------------------------
    // SUBSCRIBE
    // --------------------------------------------------------

    on(eventName, callback) {

        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(
            callback
        );
    },

    // --------------------------------------------------------
    // UNSUBSCRIBE
    // --------------------------------------------------------

    off(eventName, callback) {

        const list =
            this.listeners[eventName];

        if (!list) {
            return;
        }

        const index =
            list.indexOf(
                callback
            );

        if (index !== -1) {
            list.splice(index, 1);
        }
    },

    // --------------------------------------------------------
    // EMIT
    // --------------------------------------------------------

    emit(eventName, payload) {

        const list =
            this.listeners[eventName];

        if (!list || list.length === 0) {
            return;
        }

        /*
         * Copy before iterating so a listener that
         * subscribes/unsubscribes during the emit doesn't
         * corrupt this pass.
         */

        [...list].forEach(callback => {

            try {

                callback(payload);

            } catch (error) {

                console.error(
                    `PresentationEvents: listener for "${eventName}" threw`,
                    error
                );
            }
        });
    },

    // --------------------------------------------------------
    // CLEAR
    // --------------------------------------------------------

    clear(eventName) {

        if (eventName) {
            delete this.listeners[eventName];
        } else {
            this.listeners = {};
        }
    }
};

window.PresentationEvents = PresentationEvents;
