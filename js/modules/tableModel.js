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

    createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, config.edgeStyle, config.legStyle);

    scene.add(tableModelGroup);
    addShadowPlaneToScene(scene);

    setTimeout(function() {
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
            const overlay = document.querySelector('.canvas-overlay');
            if(overlay) overlay.style.zIndex = '5';
        }
        isModelCurrentlyLoaded = true;
        console.log("TABLEMODEL.JS: Masa modeli başarıyla oluşturuldu ve sahneye eklendi.");
    }, 350);

    return tableModelGroup;
}

function disposeTableModel(scene) {
    if (tableModelGroup) {
        tableModelGroup.traverse(function(object) {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => {
                            if (material.map) material.map.dispose();
                            material.dispose();
                        });
                    } else {
                        if (object.material.map) object.material.map.dispose();
                        object.material.dispose();
                    }
                }
            }
        });
        scene.remove(tableModelGroup);
        tableModelGroup = null;
    }
    if (shadowPlane) {
        if (shadowPlane.geometry) shadowPlane.geometry.dispose();
        if (shadowPlane.material) shadowPlane.material.dispose();
        scene.remove(shadowPlane);
        shadowPlane = null;
    }
    isModelCurrentlyLoaded = false;
}

function createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, edgeStyle, legStyle) {
    let tableTopMesh;
    if (legStyle === 'l-shape') {
         createLShapeTable(width, length, height, thickness, topMaterial, legMaterial);
         return;
    } else {
        if (edgeStyle === 'beveled') {
            tableTopMesh = createBeveledTableTopGeometry(width, length, thickness, topMaterial);
        } else if (edgeStyle === 'rounded') {
            tableTopMesh = createRoundedTableTopGeometry(width, length, thickness, topMaterial);
        } else {
            const topGeom = new THREE.BoxGeometry(width, thickness, length);
            tableTopMesh = new THREE.Mesh(topGeom, topMaterial);
        }
        tableTopMesh.name = "TableTop";
        tableTopMesh.position.y = height - (thickness / 2);
        tableTopMesh.castShadow = true;
        tableTopMesh.receiveShadow = true;
        tableModelGroup.add(tableTopMesh);
    }

    if (legStyle === 'u-shape') {
        createUShapeLegsGeometry(width, length, height, thickness, legMaterial);
    } else if (legStyle === 'x-shape') {
        createXShapeLegsGeometry(width, length, height, thickness, legMaterial);
    } else {
        createStandardLegsGeometry(width, length, height, thickness, legMaterial);
    }
}

function createBeveledTableTopGeometry(width, length, thickness, material) {
    const shape = new THREE.Shape();
    const R = 0.02;
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
}

function createUShapeLegsGeometry(width, length, height, thickness, legMaterial) {
    const legBarThickness = Math.max(0.03, Math.min(width, length) * 0.04);
    const legHeight = height - thickness;
    const legInset = Math.max(0.08, Math.min(width, length) * 0.08);
    [-1, 1].forEach((sideMultiplier, sideIndex) => {
        const zPos = sideMultiplier * (length / 2 - legInset);
        const verticalBarGeom = new THREE.BoxGeometry(legBarThickness, legHeight, legBarThickness);
        const leg1 = new THREE.Mesh(verticalBarGeom, legMaterial);
        leg1.position.set(width / 2 - legInset, legHeight / 2, zPos); leg1.castShadow = true;
        tableModelGroup.add(leg1);
        const leg2 = new THREE.Mesh(verticalBarGeom, legMaterial);
        leg2.position.set(-width / 2 + legInset, legHeight / 2, zPos); leg2.castShadow = true;
        tableModelGroup.add(leg2);
        const connectorWidth = width - 2 * legInset + legBarThickness;
        const horizontalBarGeom = new THREE.BoxGeometry(connectorWidth, legBarThickness, legBarThickness);
        const connector = new THREE.Mesh(horizontalBarGeom, legMaterial);
        connector.position.set(0, height - thickness - legBarThickness / 2 - 0.05, zPos); connector.castShadow = true;
        tableModelGroup.add(connector);
    });
}

function createXShapeLegsGeometry(width, length, height, thickness, legMaterial) {
    const legBarThickness = Math.max(0.04, Math.min(width, length) * 0.05);
    const legHeight = height - thickness;
    const legFrameInsetZ = Math.max(0.1, length * 0.12);

    // X ayakların üstteki temas noktalarının tabla kenarına olan mesafesi
    // Bu değer X ayakların ne kadar "içeride" veya "dışarıda" olacağını belirler.
    // 0'a yakın olması, ayakların dış kenarlarının tabla kenarıyla hizalanması anlamına gelir.
    const xFrameEdgeInset = legBarThickness * 0.25; // Ayak kalınlığının çeyreği kadar içeriden başlasın. Bu değeri deneyerek ayarlayabilirsiniz.
    const xFrameTopSpan = width - (2 * xFrameEdgeInset);

    [-1, 1].forEach((sideMultiplier, sideIndex) => {
        const zPos = sideMultiplier * (length / 2 - legFrameInsetZ);
        const xFrameGroup = new THREE.Group();
        xFrameGroup.position.z = zPos;
        xFrameGroup.position.y = legHeight / 2;

        const diagonalLength = Math.sqrt(Math.pow(xFrameTopSpan, 2) + Math.pow(legHeight, 2));
        const angle = Math.atan2(legHeight, xFrameTopSpan);

        const barGeom = new THREE.BoxGeometry(legBarThickness, diagonalLength, legBarThickness);

        const bar1 = new THREE.Mesh(barGeom, legMaterial);
        bar1.rotation.z = -angle; bar1.castShadow = true;
        xFrameGroup.add(bar1);

        const bar2 = new THREE.Mesh(barGeom, legMaterial);
        bar2.rotation.z = angle; bar2.castShadow = true;
        xFrameGroup.add(bar2);

        tableModelGroup.add(xFrameGroup);
    });
    console.log(`TABLEMODEL.JS: X-Ayak - TablaG: ${width.toFixed(2)}, AyakUstAciklik: ${xFrameTopSpan.toFixed(2)}, AyakKalinlik: ${legBarThickness.toFixed(2)}`);
}

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
}

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
    scene.add(shadowPlane);
}

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

window.TableModelModule = {
    createTable,
    disposeTableModel,
    updateModelHeader,
    get isLoaded() { return isModelCurrentlyLoaded; }
};
