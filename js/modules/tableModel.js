/**
 * @file tableModel.js
 * @description Table model creation module for the Modern Table Designer application
 * Handles 3D model generation for different table styles
 */

// Module state
let tableModelGroup = null;
let shadowPlane = null;
let isModelCurrentlyLoaded = false;

/**
 * Creates a table model with the specified properties
 * @param {object} config - Configuration object for the table.
 * @param {number} config.width - Width of the table in cm.
 * @param {number} config.length - Length of the table in cm.
 * @param {number} config.height - Height of the table in cm.
 * @param {number} config.thickness - Thickness of the table top in cm.
 * @param {string} config.material - Material name for the table top.
 * @param {string} config.edgeStyle - Edge style for the table top.
 * @param {string} config.legStyle - Leg style for the table.
 * @param {THREE.Scene} scene - The Three.js scene to add the table to.
 * @returns {THREE.Group|null} The created table group or null if creation failed.
 */
function createTable(config, scene) {
    isModelCurrentlyLoaded = false;
    const loadingIndicator = document.querySelector('.model-loading');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
        loadingIndicator.querySelector('span').textContent = "Model oluşturuluyor...";
        const overlay = document.querySelector('.canvas-overlay');
        if(overlay) overlay.style.zIndex = '10'; // Ensure loading is on top
    }

    console.log("TABLEMODEL.JS: createTable çağrıldı. Yapılandırma:", config);

    // Dispose of the previous model before creating a new one
    disposeTableModel(scene);

    tableModelGroup = new THREE.Group();
    tableModelGroup.name = "InteractiveTable"; // Name for easy lookup

    // Convert dimensions from cm to meters for Three.js
    const width = config.width / 100;
    const length = config.length / 100;
    const height = config.height / 100;
    const thickness = config.thickness / 100;

    let topMaterial, legMaterial;
    try {
        // Attempt to create materials using the MaterialsModule
        console.log(`TABLEMODEL.JS: MaterialsModule.createMaterial çağrılıyor (Malzeme: ${config.material})`);
        topMaterial = window.MaterialsModule.createMaterial(config.material);
        console.log(`TABLEMODEL.JS: MaterialsModule.createMetalMaterial çağrılıyor`);
        legMaterial = window.MaterialsModule.createMetalMaterial(); // Default metal for legs
    } catch (e) {
        console.error("TABLEMODEL.JS: Malzeme oluşturulurken hata:", e);
        if (loadingIndicator) loadingIndicator.classList.remove('active');
        return null; // Return null if material creation fails
    }

    // Fallback materials in case of an issue
    if (!topMaterial) {
        console.error("TABLEMODEL.JS: Üst malzeme (topMaterial) oluşturulamadı. Varsayılan pembe kullanılıyor.");
        topMaterial = new THREE.MeshStandardMaterial({color: 0xff00ff}); // Bright pink for error
    }
     if (!legMaterial) {
        console.error("TABLEMODEL.JS: Ayak malzemesi (legMaterial) oluşturulamadı. Varsayılan camgöbeği kullanılıyor.");
        legMaterial = new THREE.MeshStandardMaterial({color: 0x00ffff}); // Bright cyan for error
    }
    console.log("TABLEMODEL.JS: Kullanılan Üst Malzeme Adı:", topMaterial.name, "Doku Var mı?", !!topMaterial.map, "Renk:", topMaterial.color.getHexString());
    console.log("TABLEMODEL.JS: Kullanılan Ayak Malzeme Adı:", legMaterial.name);

    // Create the table geometry based on style
    createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, config.edgeStyle, config.legStyle);

    scene.add(tableModelGroup);
    addShadowPlaneToScene(scene); // Add a plane to receive shadows

    // Hide loading indicator after a short delay to allow rendering
    setTimeout(function() {
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
            const overlay = document.querySelector('.canvas-overlay');
            if(overlay) overlay.style.zIndex = '5'; // Restore overlay z-index
        }
        isModelCurrentlyLoaded = true;
        console.log("TABLEMODEL.JS: Masa modeli başarıyla oluşturuldu ve sahneye eklendi.");
    }, 350); // Delay for textures to potentially load

    return tableModelGroup;
}

/**
 * Properly disposes the current table model and its resources to free memory.
 * @param {THREE.Scene} scene - The Three.js scene from which to remove the table.
 */
function disposeTableModel(scene) {
    if (tableModelGroup) {
        console.log("TABLEMODEL.JS: Önceki masa modeli temizleniyor...");
        tableModelGroup.traverse(function(object) {
            if (object.isMesh) {
                if (object.geometry) {
                    object.geometry.dispose(); // Dispose geometry
                }
                if (object.material) {
                    // If material is an array, dispose each material
                    if (Array.isArray(object.material)) {
                        object.material.forEach(function(material) {
                            if (material.map) {
                                material.map.dispose(); // Dispose texture
                                console.log("TABLEMODEL.JS: Doku temizlendi:", material.map.uuid);
                            }
                            material.dispose(); // Dispose material
                        });
                    } else {
                        // Dispose single material
                        if (object.material.map) {
                            object.material.map.dispose();
                            console.log("TABLEMODEL.JS: Doku temizlendi:", object.material.map.uuid);
                        }
                        object.material.dispose();
                    }
                }
            }
        });
        scene.remove(tableModelGroup); // Remove the group from the scene
        tableModelGroup = null;
        console.log("TABLEMODEL.JS: Önceki masa modeli başarıyla temizlendi.");
    }
    // Dispose shadow plane as well
    if (shadowPlane) {
        if (shadowPlane.geometry) shadowPlane.geometry.dispose();
        if (shadowPlane.material) shadowPlane.material.dispose();
        scene.remove(shadowPlane);
        shadowPlane = null;
    }
    isModelCurrentlyLoaded = false;
}

/**
 * Creates a table with a specific style (edge, legs).
 * This function routes to the correct geometry creation functions.
 * @param {number} width - Table width.
 * @param {number} length - Table length.
 * @param {number} height - Table height.
 * @param {number} thickness - Table top thickness.
 * @param {THREE.Material} topMaterial - Material for the table top.
 * @param {THREE.Material} legMaterial - Material for the table legs.
 * @param {string} edgeStyle - Style of the table top's edges.
 * @param {string} legStyle - Style of the table legs.
 */
function createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, edgeStyle, legStyle) {
    let tableTopMesh;
    console.log(`TABLEMODEL.JS: createTableWithStyle - Kenar: ${edgeStyle}, Ayak: ${legStyle}`);

    // Special handling for L-Shape table as it affects the entire structure
    if (legStyle === 'l-shape') {
         console.warn("TABLEMODEL.JS: 'L-Shape' seçildi. L-şeklinde masa tablası ve ayakları oluşturuluyor. Bu özellik deneyseldir.");
         // This function will create both the L-shaped top and appropriate legs
         createLShapeTable(width, length, height, thickness, topMaterial, legMaterial);
         return; // Exit after creating L-shape table
    } else {
        // Create standard rectangular table top based on edge style
        if (edgeStyle === 'beveled') {
            tableTopMesh = createBeveledTableTopGeometry(width, length, thickness, topMaterial);
        } else if (edgeStyle === 'rounded') {
            tableTopMesh = createRoundedTableTopGeometry(width, length, thickness, topMaterial);
        } else { // Default to straight edges
            const topGeom = new THREE.BoxGeometry(width, thickness, length);
            tableTopMesh = new THREE.Mesh(topGeom, topMaterial);
             console.log("TABLEMODEL.JS: Düz kenarlı masa üstü oluşturuldu. Malzeme dokusu var mı?", !!tableTopMesh.material.map);
        }

        tableTopMesh.name = "TableTop";
        tableTopMesh.position.y = height - (thickness / 2); // Position top surface correctly
        tableTopMesh.castShadow = true;
        tableTopMesh.receiveShadow = true; // Table top can also receive shadows
        tableModelGroup.add(tableTopMesh);
        console.log("TABLEMODEL.JS: Masa üstü eklendi:", tableTopMesh);
    }

    // Create legs based on leg style (if not L-shape)
    if (legStyle === 'u-shape') {
        createUShapeLegsGeometry(width, length, height, thickness, legMaterial);
    } else if (legStyle === 'x-shape') {
        createXShapeLegsGeometry(width, length, height, thickness, legMaterial); // X-shape legs
    } else { // Default to standard legs
        createStandardLegsGeometry(width, length, height, thickness, legMaterial);
    }
}

/**
 * Creates a beveled edge table top geometry using THREE.ExtrudeGeometry.
 * @param {number} width - Width of the table top.
 * @param {number} length - Length of the table top.
 * @param {number} thickness - Thickness of the table top.
 * @param {THREE.Material} material - Material for the table top.
 * @returns {THREE.Mesh} The created table top mesh.
 */
function createBeveledTableTopGeometry(width, length, thickness, material) {
    const shape = new THREE.Shape();
    const R = 0.02; // Bevel radius/offset

    shape.moveTo(-width / 2 + R, -length / 2);
    shape.lineTo(width / 2 - R, -length / 2);
    shape.absarc(width / 2 - R, -length / 2 + R, R, -Math.PI / 2, 0, false);
    shape.lineTo(width / 2, length / 2 - R);
    shape.absarc(width / 2 - R, length / 2 - R, R, 0, Math.PI / 2, false);
    shape.lineTo(-width / 2 + R, length / 2);
    shape.absarc(-width / 2 + R, length / 2 - R, R, Math.PI / 2, Math.PI, false);
    shape.lineTo(-width / 2, -length / 2 + R);
    shape.absarc(-width / 2 + R, -length / 2 + R, R, Math.PI, Math.PI * 3 / 2, false);

    const extrudeSettings = {
        steps: 1, depth: thickness, bevelEnabled: true,
        bevelThickness: thickness * 0.15, bevelSize: thickness * 0.1,
        bevelOffset: -thickness * 0.05, bevelSegments: 3
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); geometry.rotateX(Math.PI / 2);
    return new THREE.Mesh(geometry, material);
}

/**
 * Creates a rounded edge table top geometry using THREE.ExtrudeGeometry.
 * @param {number} width - Width of the table top.
 * @param {number} length - Length of the table top.
 * @param {number} thickness - Thickness of the table top.
 * @param {THREE.Material} material - Material for the table top.
 * @returns {THREE.Mesh} The created table top mesh.
 */
function createRoundedTableTopGeometry(width, length, thickness, material) {
    const R = Math.min(width, length) * 0.08;
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + R, -length / 2);
    shape.lineTo(width / 2 - R, -length / 2);
    shape.quadraticCurveTo(width / 2, -length / 2, width / 2, -length / 2 + R);
    shape.lineTo(width / 2, length / 2 - R);
    shape.quadraticCurveTo(width / 2, length / 2, width / 2 - R, length / 2);
    shape.lineTo(-width / 2 + R, length / 2);
    shape.quadraticCurveTo(-width / 2, length / 2, -width / 2, length / 2 - R);
    shape.lineTo(-width / 2, -length / 2 + R);
    shape.quadraticCurveTo(-width / 2, -length / 2, -width / 2 + R, -length / 2);

    const extrudeSettings = {
        steps: 1, depth: thickness, bevelEnabled: true,
        bevelThickness: thickness * 0.1, bevelSize: thickness * 0.08,
        bevelOffset: 0, bevelSegments: 5
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); geometry.rotateX(Math.PI / 2);
    return new THREE.Mesh(geometry, material);
}

/**
 * Creates standard four-legged table legs.
 * @param {number} width - Table width.
 * @param {number} length - Table length.
 * @param {number} height - Table height.
 * @param {number} thickness - Table top thickness.
 * @param {THREE.Material} legMaterial - Material for the legs.
 */
function createStandardLegsGeometry(width, length, height, thickness, legMaterial) {
    const legSize = Math.max(0.04, Math.min(width, length) * 0.05);
    const legHeight = height - thickness;
    const inset = Math.max(0.05, Math.min(width, length) * 0.1);
    const legPositions = [
        new THREE.Vector3(width / 2 - inset, legHeight / 2, length / 2 - inset),
        new THREE.Vector3(-width / 2 + inset, legHeight / 2, length / 2 - inset),
        new THREE.Vector3(width / 2 - inset, legHeight / 2, -length / 2 + inset),
        new THREE.Vector3(-width / 2 + inset, legHeight / 2, -length / 2 + inset)
    ];
    legPositions.forEach((pos, index) => {
        const legGeom = new THREE.BoxGeometry(legSize, legHeight, legSize);
        const legMesh = new THREE.Mesh(legGeom, legMaterial);
        legMesh.name = "StandardLeg_" + index;
        legMesh.position.copy(pos); legMesh.castShadow = true; legMesh.receiveShadow = true;
        tableModelGroup.add(legMesh);
    });
    console.log("TABLEMODEL.JS: Standart ayaklar oluşturuldu.");
}

/**
 * Creates U-shaped table legs.
 * @param {number} width - Table width.
 * @param {number} length - Table length.
 * @param {number} height - Table height.
 * @param {number} thickness - Table top thickness.
 * @param {THREE.Material} legMaterial - Material for the legs.
 */
function createUShapeLegsGeometry(width, length, height, thickness, legMaterial) {
    const legBarThickness = Math.max(0.03, Math.min(width, length) * 0.04);
    const legHeight = height - thickness;
    const legInset = Math.max(0.08, Math.min(width, length) * 0.08);
    [-1, 1].forEach((sideMultiplier, sideIndex) => {
        const zPos = sideMultiplier * (length / 2 - legInset);
        const verticalBarGeom = new THREE.BoxGeometry(legBarThickness, legHeight, legBarThickness);
        const leg1 = new THREE.Mesh(verticalBarGeom, legMaterial);
        leg1.name = `UShapeLeg_Side${sideIndex}_V1`;
        leg1.position.set(width / 2 - legInset, legHeight / 2, zPos); leg1.castShadow = true;
        tableModelGroup.add(leg1);
        const leg2 = new THREE.Mesh(verticalBarGeom, legMaterial);
        leg2.name = `UShapeLeg_Side${sideIndex}_V2`;
        leg2.position.set(-width / 2 + legInset, legHeight / 2, zPos); leg2.castShadow = true;
        tableModelGroup.add(leg2);
        const connectorWidth = width - 2 * legInset + legBarThickness;
        const horizontalBarGeom = new THREE.BoxGeometry(connectorWidth, legBarThickness, legBarThickness);
        const connector = new THREE.Mesh(horizontalBarGeom, legMaterial);
        connector.name = `UShapeLeg_Side${sideIndex}_Connector`;
        connector.position.set(0, height - thickness - legBarThickness / 2 - 0.05, zPos); connector.castShadow = true;
        tableModelGroup.add(connector);
    });
    console.log("TABLEMODEL.JS: U-şekilli ayaklar oluşturuldu.");
}

/**
 * Creates X-shaped table legs.
 * @param {number} width - Table width (used to determine the span of the X-frame).
 * @param {number} length - Table length (used to position the X-frames).
 * @param {number} height - Table height.
 * @param {number} thickness - Table top thickness.
 * @param {THREE.Material} legMaterial - Material for the legs.
 */
function createXShapeLegsGeometry(width, length, height, thickness, legMaterial) {
    const legBarThickness = Math.max(0.04, Math.min(width, length) * 0.05);
    const legHeight = height - thickness;

    const legFrameInsetZ = Math.max(0.1, length * 0.12);

    // X ayakların üstteki temas noktalarının tabla kenarına olan mesafesi
    const topPointInset = legBarThickness / 2; // Ayak kalınlığının yarısı kadar içeride (merkezden değil, dıştan)
    const xFrameTopSpan = width - (2 * topPointInset); // X'in üstteki efektif genişliği

    [-1, 1].forEach((sideMultiplier, sideIndex) => {
        const zPos = sideMultiplier * (length / 2 - legFrameInsetZ);
        const xFrameGroup = new THREE.Group();
        xFrameGroup.position.z = zPos;
        xFrameGroup.position.y = legHeight / 2; // X'in kesişim noktasını dikeyde ortala

        const diagonalLength = Math.sqrt(Math.pow(xFrameTopSpan, 2) + Math.pow(legHeight, 2));
        const angle = Math.atan2(legHeight, xFrameTopSpan);

        const barGeom = new THREE.BoxGeometry(legBarThickness, diagonalLength, legBarThickness);

        const bar1 = new THREE.Mesh(barGeom, legMaterial);
        bar1.name = `XShapeLeg_Side${sideIndex}_Bar1`;
        bar1.rotation.z = -angle;
        bar1.castShadow = true;
        xFrameGroup.add(bar1);

        const bar2 = new THREE.Mesh(barGeom, legMaterial);
        bar2.name = `XShapeLeg_Side${sideIndex}_Bar2`;
        bar2.rotation.z = angle;
        bar2.castShadow = true;
        xFrameGroup.add(bar2);

        tableModelGroup.add(xFrameGroup);
    });
    console.log("TABLEMODEL.JS: X-şekilli ayaklar oluşturuldu. X Üst Açıklığı:", xFrameTopSpan);
}

/**
 * Creates an L-shaped table geometry (Table top and legs). (Basic Version)
 * @param {number} width - Overall width of the L-shape's bounding box.
 * @param {number} length - Overall length of the L-shape's bounding box.
 * @param {number} height - Table height.
 * @param {number} thickness - Table top thickness.
 * @param {THREE.Material} topMaterial - Material for the table top.
 * @param {THREE.Material} legMaterial - Material for the table legs.
 */
function createLShapeTable(width, length, height, thickness, topMaterial, legMaterial) {
    const mainArmWidth = width;
    const mainArmLength = length * 0.6;
    const sideArmWidth = width * 0.4;
    const sideArmLength = length;

    const mainArmGeom = new THREE.BoxGeometry(mainArmWidth, thickness, mainArmLength);
    const mainArmMesh = new THREE.Mesh(mainArmGeom, topMaterial);
    mainArmMesh.position.set(0, height - thickness / 2, (length / 2) - (mainArmLength / 2) );
    mainArmMesh.castShadow = true; mainArmMesh.receiveShadow = true;
    tableModelGroup.add(mainArmMesh);

    const sideArmGeom = new THREE.BoxGeometry(sideArmWidth, thickness, sideArmLength);
    const sideArmMesh = new THREE.Mesh(sideArmGeom, topMaterial);
    sideArmMesh.position.set(-(width/2) + (sideArmWidth/2) , height - thickness / 2, 0);
    sideArmMesh.castShadow = true; sideArmMesh.receiveShadow = true;
    tableModelGroup.add(sideArmMesh);

    const legSize = Math.max(0.04, Math.min(width, length) * 0.05);
    const legHeight = height - thickness;
    const inset = 0.1;
    const legPositions = [
        new THREE.Vector3(mainArmWidth / 2 - inset, legHeight / 2, length / 2 - inset),
        new THREE.Vector3(-mainArmWidth / 2 + inset, legHeight / 2, length / 2 - inset),
        new THREE.Vector3(-(width/2) + inset , legHeight / 2, length/2 - inset),
        new THREE.Vector3(-(width/2) + inset, legHeight/2, -length/2 + inset),
        new THREE.Vector3(mainArmWidth/2 -inset, legHeight/2, (length / 2) - mainArmLength + inset),
        new THREE.Vector3(-(width/2) + sideArmWidth - inset, legHeight/2, -length/2 + inset)
    ];
     legPositions.forEach((pos, index) => {
        const legGeom = new THREE.BoxGeometry(legSize, legHeight, legSize);
        const legMesh = new THREE.Mesh(legGeom, legMaterial);
        legMesh.name = "LLeg_" + index;
        legMesh.position.copy(pos); legMesh.castShadow = true; legMesh.receiveShadow = true;
        tableModelGroup.add(legMesh);
    });
    console.log("TABLEMODEL.JS: L-şekilli masa ve ayaklar oluşturuldu.");
}


/**
 * Adds a shadow-receiving plane to the scene below the table.
 * @param {THREE.Scene} scene - The Three.js scene.
 */
function addShadowPlaneToScene(scene) {
    if (shadowPlane) {
        if (shadowPlane.geometry) shadowPlane.geometry.dispose();
        if (shadowPlane.material) shadowPlane.material.dispose();
        scene.remove(shadowPlane); shadowPlane = null;
    }
    const planeSize = 10;
    const groundGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.35, side: THREE.DoubleSide });
    shadowPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    shadowPlane.name = "ShadowPlane";
    scene.add(shadowPlane);
    console.log("TABLEMODEL.JS: Gölge düzlemi eklendi/güncellendi.");
}

/**
 * Updates the model header in the UI with current material and edge style information.
 * @param {string} currentMaterial - Name of the current material.
 * @param {string} edgeStyle - Name of the current edge style.
 */
function updateModelHeader(currentMaterial, edgeStyle) {
    const edgeLabel = edgeStyle.charAt(0).toUpperCase() + edgeStyle.slice(1);
    const materialProps = window.MaterialsModule.getMaterialProperties(currentMaterial);
    const materialLabel = materialProps ? materialProps.name : currentMaterial.charAt(0).toUpperCase() + currentMaterial.slice(1);
    const headerElement = document.querySelector('.preview-header h3');
    if (headerElement) {
        headerElement.innerHTML =
            `Masa Önizleme <span class="material-indicator">${materialLabel}</span> <span class="edge-indicator">${edgeLabel} Kenar</span>`;
    }
}

// Expose public functions of the module
window.TableModelModule = {
    createTable,
    disposeTableModel,
    updateModelHeader,
    get isLoaded() { return isModelCurrentlyLoaded; }
};
