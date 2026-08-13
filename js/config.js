// Game Configuration - Adjusted Physics
const CONFIG = {
    // Canvas
    canvasWidth: 420,
    canvasHeight: 750,
    
    // Physics
    gravity: { x: 0, y: 0.6 },  // Even softer gravity
    airFriction: 0.005,  // More air resistance
    groundFriction: 0.4,
    
    // Pancake
    pancakeWidth: 56,
    pancakeHeight: 14,
    pancakeDensity: 0.002,  // Lighter pancake
    pancakeRestitution: 0.1,
    pancakeFriction: 0.4,
    flipForceMultiplier: 2.5,  // Reduced force
    maxFlipPower: 20,  // Increased max for more control
    flipChargeRate: 0.15,  // SLOWER charge rate (was 0.3)
    rotationSpeed: 0.05,  // Slower rotation
    
    // Kitchen
    counterY: 630,
    startX: 90,
    
    // Butter
    butterRestitution: 1.3,  // Less bouncy
    butterFriction: 0.05,
    
    // Colors
    colors: {
        background: '#fef3e2',
        backgroundDark: '#fae5c8',
        wall: '#f5e6d3',
        wallTile: '#fff5e8',
        counter: '#c4956a',
        counterTop: '#d4a574',
        counterSide: '#a87b52',
        pancake: '#e8a860',
        pancakeDark: '#d4903b',
        pancakeLight: '#f0c080',
        butter: '#ffe066',
        butterShadow: '#f0c040',
        plate: '#ffffff',
        plateShadow: '#e0d0c0',
        syrup: '#8b4513',
        syrupDark: '#6b3008',
        griddle: '#555',
        griddleHot: '#ff5522',
        text: '#5c3a1e',
        window: '#aed4f0',
        windowFrame: '#f5e6d3'
    }
};

// Export for use in other files
window.CONFIG = CONFIG;