/**
 * @file tableModel.js
 * @description Table model creation module for the Modern Table Designer application
 * Handles 3D model generation for different table styles
 */

// Module state
let tableModel = null;
let isModelLoaded = false;

/**
 * Creates a table model with the specified properties
 * @param {Object} config - Table configuration object
 * @param {number} config.width - Table width in cm
 * @param {number} config.length - Table length in cm
 * @param {number} config.height - Table height in cm
 * @param {number} config.thickness - Table top thickness in cm
 * @param {string} config.material - Material name
 * @param {string} config.edgeStyle - Edge style ('straight', 'beveled', or 'rounded')
 * @param {string} config.legStyle - Leg style ('standard', 'tapered', or 'x-style')
 * @param {THREE.Scene} scene - The Three.js scene to add the model to
 * @returns {THREE.Group} The created table model
 */
function createTable(config, scene) {
    // Make sure loading indicator is visible during model creation
    const loadingIndicator = document.querySelector('.model-loading');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
        document.querySelector('.canvas-overlay').style.zIndex = '10';
    }
    
    // Clear any existing model and dispose resources
    if (tableModel) {
        disposeTableModel(scene);
    }
    
    // Create table group to hold all parts
    tableModel = new THREE.Group();
    
    // Convert dimensions from cm to meters
    const width = config.width / 100;
    const length = config.length / 100;
    const height = config.height / 100;
    const thickness = config.thickness / 100; // Convert thickness from cm to meters
    
    // Get materials
    console.log("TableModel creating material, material name:", config.material);
    
    // Force a completely new material creation each time
    THREE.Cache.clear(); // Clear any cached textures
    
    // Create material with extra emphasis on unique material per type
    const topMaterial = window.MaterialsModule.createMaterial(config.material, {
        // Override some properties to make material differences more obvious
        roughness: 0.5,
        metalness: 0.2
    });
    
    const legMaterial = window.MaterialsModule.createMetalMaterial();
    
    // Create the table with the specified properties
    createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, config.edgeStyle, config.legStyle);
    
    // Add model to scene
    scene.add(tableModel);
    
    // Position the table group - center in the scene
    tableModel.position.set(0, 0, 0);
    
    // Add a plane for shadow beneath table
    addShadowPlane(scene);
    
    // Hide loading indicator with a slight delay to ensure model is fully rendered
    setTimeout(function() {
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
        isModelLoaded = true;
    }, 500);
    
    return tableModel;
}

/**
 * Properly disposes the current table model and removes from scene
 * @param {THREE.Scene} scene - The scene containing the model
 */
function disposeTableModel(scene) {
    if (!tableModel) return;
    
    console.log("Disposing table model and all resources");
    
    // Dispose geometries and materials to prevent memory leaks
    tableModel.traverse(function(child) {
        if (child.isMesh) {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(function(material) {
                        // Also dispose textures
                        if (material.map) {
                            material.map.dispose();
                        }
                        material.dispose();
                    });
                } else {
                    // Also dispose textures
                    if (child.material.map) {
                        child.material.map.dispose();
                    }
                    child.material.dispose();
                }
            }
        }
    });
    
    scene.remove(tableModel);
    tableModel = null;
}

/**
 * Creates a table with a specific style
 * @private
 */
function createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, edgeStyle, legStyle) {
    // Create table top with proper edge style
    let tableTop;
    
    // Apply different edge styles
    if (edgeStyle === 'beveled') {
        tableTop = createBeveledTableTop(width, length, thickness, topMaterial);
    } else if (edgeStyle === 'rounded') {
        tableTop = createRoundedTableTop(width, length, thickness, topMaterial);
    } else {
        // Create straight edge table top (default)
        const topGeometry = new THREE.BoxGeometry(width, thickness, length);
        tableTop = new THREE.Mesh(topGeometry, topMaterial);
    }
    
    tableTop.position.y = height - thickness / 2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableModel.add(tableTop);
    
    // Create legs based on selected leg style
    if (legStyle === 'u-shape') {
        createUShapeLegs(width, length, height, thickness, legMaterial);
    } else {
        // Standard legs (default)
        createStandardLegs(width, length, height, thickness, legMaterial);
    }
}

/**
 * Creates a beveled edge table top
 * @private
 */
function createBeveledTableTop(width, length, thickness, material) {
    // Create a shape for the beveled table top
    const shape = new THREE.Shape();
    const bevelSize = 0.02; // 2cm bevel
    
    // Define the shape with beveled corners
    shape.moveTo(-width/2 + bevelSize, -length/2);
    shape.lineTo(width/2 - bevelSize, -length/2);
    shape.lineTo(width/2, -length/2 + bevelSize);
    shape.lineTo(width/2, length/2 - bevelSize);
    shape.lineTo(width/2 - bevelSize, length/2);
    shape.lineTo(-width/2 + bevelSize, length/2);
    shape.lineTo(-width/2, length/2 - bevelSize);
    shape.lineTo(-width/2, -length/2 + bevelSize);
    shape.lineTo(-width/2 + bevelSize, -length/2);
    
    // Extrude settings
    const extrudeSettings = {
        steps: 1,
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: thickness * 0.2,
        bevelSize: thickness * 0.1,
        bevelOffset: 0,
        bevelSegments: 3
    };
    
    // Create geometry and mesh
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(Math.PI / 2); // rotate to correct orientation
    
    return new THREE.Mesh(geometry, material);
}

/**
 * Creates a rounded edge table top
 * @private
 */
function createRoundedTableTop(width, length, thickness, material) {
    // Create a shape for rounded edges
    const shape = new THREE.Shape();
    const radius = 0.05; // 5cm corner radius
    
    // Define the shape with rounded corners
    shape.moveTo(-width/2 + radius, -length/2);
    shape.lineTo(width/2 - radius, -length/2);
    shape.quadraticCurveTo(width/2, -length/2, width/2, -length/2 + radius);
    shape.lineTo(width/2, length/2 - radius);
    shape.quadraticCurveTo(width/2, length/2, width/2 - radius, length/2);
    shape.lineTo(-width/2 + radius, length/2);
    shape.quadraticCurveTo(-width/2, length/2, -width/2, length/2 - radius);
    shape.lineTo(-width/2, -length/2 + radius);
    shape.quadraticCurveTo(-width/2, -length/2, -width/2 + radius, -length/2);
    
    // Extrude settings
    const extrudeSettings = {
        steps: 1,
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: thickness * 0.15,
        bevelSize: thickness * 0.1,
        bevelOffset: 0,
        bevelSegments: 5
    };
    
    // Create geometry and mesh
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(Math.PI / 2); // rotate to correct orientation
    
    return new THREE.Mesh(geometry, material);
}

/**
 * Creates standard table legs
 * @private
 */
function createStandardLegs(width, length, height, thickness, legMaterial) {
    // Calculate leg dimensions proportional to table size
    const tableSize = Math.min(width, length); // Use the smaller dimension for proportionality
    const legWidth = Math.max(tableSize * 0.05, 0.03); // 5% of table size, min 3cm
    const legDepth = legWidth; // Square legs
    const legHeight = height - thickness;
    
    // Calculate leg inset proportional to table size
    const legInset = Math.max(tableSize * 0.1, 0.1); // 10% of table size, min 10cm
    
    // Create 4 legs at the corners
    for (let i = 0; i < 4; i++) {
        const xPos = (i % 2 === 0 ? -1 : 1) * (width / 2 - legInset);
        const zPos = (i < 2 ? 1 : -1) * (length / 2 - legInset);
        
        const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(xPos, legHeight / 2, zPos);
        leg.castShadow = true;
        tableModel.add(leg);
    }
}

/**
 * Creates U-shaped table legs - two connected sides
 * @private
 */
function createUShapeLegs(width, length, height, thickness, legMaterial) {
    // Calculate leg dimensions proportional to table size
    const tableSize = Math.min(width, length);
    const legWidth = Math.max(tableSize * 0.04, 0.03); // 4% of table size, min 3cm
    const legDepth = legWidth;
    const legHeight = height - thickness;
    
    // Calculate leg inset proportional to table size
    const legInset = Math.max(tableSize * 0.08, 0.08); // 8% of table size, min 8cm
    
    // Calculate connector position - slightly recessed from the edge
    const connectorInset = legInset * 0.5;
    
    // Create two U-shaped leg sets (one on each end)
    for (let side = 0; side < 2; side++) {
        const zPos = (side === 0 ? 1 : -1) * (length / 2 - legInset);
        
        // Create the vertical legs at the corners
        for (let i = 0; i < 2; i++) {
            const xPos = (i === 0 ? -1 : 1) * (width / 2 - legInset);
            
            // Vertical leg
            const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(xPos, legHeight / 2, zPos);
            leg.castShadow = true;
            tableModel.add(leg);
        }
        
        // Create the horizontal connector between the legs
        const connectorWidth = width - (2 * legInset) + legWidth;
        const connectorHeight = legWidth;
        const connectorDepth = legDepth;
        const connectorY = legHeight * 0.2; // Position 20% up from the bottom
        
        const connectorGeometry = new THREE.BoxGeometry(connectorWidth, connectorHeight, connectorDepth);
        const connector = new THREE.Mesh(connectorGeometry, legMaterial);
        connector.position.set(0, connectorY, zPos);
        connector.castShadow = true;
        tableModel.add(connector);
    }
}

/**
 * Creates a metal bar element
 * @private
 */
function createMetalBar(width, height, depth, x, y, z, material, rotation = 0) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(x, y, z);
    if (rotation !== 0) {
        bar.rotation.y = rotation;
    }
    bar.castShadow = true;
    tableModel.add(bar);
    return bar;
}

/**
 * Adds a shadow-receiving plane beneath the table
 * @private
 */
function addShadowPlane(scene) {
    const groundGeometry = new THREE.PlaneGeometry(15, 15);
    const groundMaterial = new THREE.ShadowMaterial({
        opacity: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
}

/**
 * Updates the model's header with current material and edge style information
 * @param {string} currentMaterial - Current material name 
 * @param {string} edgeStyle - Current edge style
 */
function updateModelHeader(currentMaterial, edgeStyle) {
    // Update header to show current material and edge style
    const edgeLabel = edgeStyle.charAt(0).toUpperCase() + edgeStyle.slice(1);
    const materialLabel = currentMaterial.charAt(0).toUpperCase() + currentMaterial.slice(1);
    
    const headerElement = document.querySelector('.preview-header h3');
    if (headerElement) {
        headerElement.innerHTML = 
            `Masa Önizleme <span class="material-indicator">${materialLabel}</span> 
            <span class="edge-indicator">${edgeLabel} Kenar</span>`;
    }
}

// Export the module's public API
window.TableModelModule = {
    createTable,
    disposeTableModel,
    updateModelHeader,
    get isLoaded() { return isModelLoaded; }
};