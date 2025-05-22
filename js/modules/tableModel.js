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
 */
function createTable(config, scene) {
    isModelCurrentlyLoaded = false;
    const loadingIndicator = document.querySelector('.model-loading');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
        loadingIndicator.querySelector('span').textContent = "Model oluşturuluyor...";
        const overlay = document.querySelector('.canvas-overlay');
        if(overlay) overlay.style.zIndex = '10'; 
    }
    
    console.log("TABLEMODEL.JS: createTable çağrıldı. Yapılandırma:", config);

    disposeTableModel(scene);
    
    tableModelGroup = new THREE.Group();
    tableModelGroup.name = "InteractiveTable"; 
    
    const width = config.width / 100;
    const length = config.length / 100;
    const height = config.height / 100;
    const thickness = config.thickness / 100; 
    
    let topMaterial, legMaterial;
    try {
        // THREE.Cache.clear(); // Genellikle gerekli değil ve performansı düşürebilir. 
                               // Doku güncelleme sorunları varsa materials.js'deki texture.needsUpdate = true; yeterli olmalı.
        console.log(`TABLEMODEL.JS: MaterialsModule.createMaterial çağrılıyor (${config.material})`);
        topMaterial = window.MaterialsModule.createMaterial(config.material);
        console.log(`TABLEMODEL.JS: MaterialsModule.createMetalMaterial çağrılıyor`);
        legMaterial = window.MaterialsModule.createMetalMaterial(); 
    } catch (e) {
        console.error("TABLEMODEL.JS: Malzeme oluşturulurken hata:", e);
        if (loadingIndicator) loadingIndicator.classList.remove('active');
        return null; 
    }

    if (!topMaterial) {
        console.error("TABLEMODEL.JS: Üst malzeme (topMaterial) oluşturulamadı. Muhtemelen MaterialsModule.createMaterial bir sorunla karşılaştı.");
        topMaterial = new THREE.MeshStandardMaterial({color: 0xff00ff}); // Hata durumunda parlak pembe
    }
     if (!legMaterial) {
        console.error("TABLEMODEL.JS: Ayak malzemesi (legMaterial) oluşturulamadı.");
        legMaterial = new THREE.MeshStandardMaterial({color: 0x00ffff}); // Hata durumunda parlak camgöbeği
    }
    console.log("TABLEMODEL.JS: Üst Malzeme Adı:", topMaterial.name, "Doku Var mı?", !!topMaterial.map);
    console.log("TABLEMODEL.JS: Ayak Malzeme Adı:", legMaterial.name);
    
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
    }, 350); // Biraz daha uzun gecikme, dokuların yüklenmesine zaman tanımak için
    
    return tableModelGroup;
}

/**
 * Properly disposes the current table model and its resources
 */
function disposeTableModel(scene) {
    if (tableModelGroup) {
        console.log("TABLEMODEL.JS: Önceki masa modeli temizleniyor...");
        tableModelGroup.traverse(function(object) {
            if (object.isMesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(function(material) {
                            if (material.map) {
                                material.map.dispose(); 
                                console.log("TABLEMODEL.JS: Doku temizlendi:", material.map.uuid);
                            }
                            material.dispose();
                        });
                    } else {
                        if (object.material.map) {
                            object.material.map.dispose();
                            console.log("TABLEMODEL.JS: Doku temizlendi:", object.material.map.uuid);
                        }
                        object.material.dispose();
                    }
                }
            }
        });
        scene.remove(tableModelGroup); 
        tableModelGroup = null;
        console.log("TABLEMODEL.JS: Önceki masa modeli başarıyla temizlendi.");
    }
    if (shadowPlane) {
        if (shadowPlane.geometry) shadowPlane.geometry.dispose();
        if (shadowPlane.material) shadowPlane.material.dispose();
        scene.remove(shadowPlane);
        shadowPlane = null;
    }
    isModelCurrentlyLoaded = false;
}

/**
 * Creates a table with a specific style (edge, legs)
 */
function createTableWithStyle(width, length, height, thickness, topMaterial, legMaterial, edgeStyle, legStyle) {
    let tableTopMesh;
    console.log(`TABLEMODEL.JS: createTableWithStyle - Kenar: ${edgeStyle}, Ayak: ${legStyle}`);
    
    if (edgeStyle === 'beveled') {
        tableTopMesh = createBeveledTableTopGeometry(width, length, thickness, topMaterial);
    } else if (edgeStyle === 'rounded') {
        tableTopMesh = createRoundedTableTopGeometry(width, length, thickness, topMaterial);
    } else { 
        const topGeom = new THREE.BoxGeometry(width, thickness, length);
        tableTopMesh = new THREE.Mesh(topGeom, topMaterial);
         console.log("TABLEMODEL.JS: Düz kenarlı masa üstü oluşturuldu. Malzeme dokusu var mı?", !!tableTopMesh.material.map);
    }
    
    tableTopMesh.name = "TableTop";
    tableTopMesh.position.y = height - (thickness / 2); 
    tableTopMesh.castShadow = true;    
    tableTopMesh.receiveShadow = true; 
    tableModelGroup.add(tableTopMesh);
    console.log("TABLEMODEL.JS: Masa üstü eklendi:", tableTopMesh);
    
    if (legStyle === 'u-shape') {
        createUShapeLegsGeometry(width, length, height, thickness, legMaterial);
    } else { 
        createStandardLegsGeometry(width, length, height, thickness, legMaterial);
    }
}

/**
 * Creates a beveled edge table top geometry
 */
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
        steps: 1,
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: thickness * 0.15, 
        bevelSize: thickness * 0.1,      
        bevelOffset: -thickness * 0.05,  
        bevelSegments: 3                 
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); 
    geometry.rotateX(Math.PI / 2); 
    
    const mesh = new THREE.Mesh(geometry, material);
    console.log("TABLEMODEL.JS: Pahlı kenarlı masa üstü oluşturuldu. Malzeme dokusu var mı?", !!mesh.material.map);
    return mesh;
}

/**
 * Creates a rounded edge table top geometry
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
        steps: 1,
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: thickness * 0.1,
        bevelSize: thickness * 0.08,
        bevelOffset: 0,
        bevelSegments: 5 
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.rotateX(Math.PI / 2);
    
    const mesh = new THREE.Mesh(geometry, material);
    console.log("TABLEMODEL.JS: Yuvarlak kenarlı masa üstü oluşturuldu. Malzeme dokusu var mı?", !!mesh.material.map);
    return mesh;
}

/**
 * Creates standard table legs geometry
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
        legMesh.position.copy(pos);
        legMesh.castShadow = true;
        legMesh.receiveShadow = true;
        tableModelGroup.add(legMesh);
    });
    console.log("TABLEMODEL.JS: Standart ayaklar oluşturuldu.");
}

/**
 * Creates U-shaped table legs geometry
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
        leg1.position.set(width / 2 - legInset, legHeight / 2, zPos);
        leg1.castShadow = true;
        tableModelGroup.add(leg1);

        const leg2 = new THREE.Mesh(verticalBarGeom, legMaterial);
        leg2.name = `UShapeLeg_Side${sideIndex}_V2`;
        leg2.position.set(-width / 2 + legInset, legHeight / 2, zPos);
        leg2.castShadow = true;
        tableModelGroup.add(leg2);
        
        const connectorWidth = width - 2 * legInset + legBarThickness; 
        const horizontalBarGeom = new THREE.BoxGeometry(connectorWidth, legBarThickness, legBarThickness);
        const connector = new THREE.Mesh(horizontalBarGeom, legMaterial);
        connector.name = `UShapeLeg_Side${sideIndex}_Connector`;
        connector.position.set(0, legBarThickness / 2 + 0.02, zPos); 
        connector.castShadow = true;
        tableModelGroup.add(connector);
    });
    console.log("TABLEMODEL.JS: U-şekilli ayaklar oluşturuldu.");
}


/**
 * Adds a shadow-receiving plane to the scene
 */
function addShadowPlaneToScene(scene) {
    if (shadowPlane) {
        if (shadowPlane.geometry) shadowPlane.geometry.dispose();
        if (shadowPlane.material) shadowPlane.material.dispose();
        scene.remove(shadowPlane);
        shadowPlane = null;
    }

    const planeSize = 10; 
    const groundGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.35, side: THREE.DoubleSide }); // Opaklık biraz artırıldı
    shadowPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    shadowPlane.rotation.x = -Math.PI / 2; 
    shadowPlane.position.y = 0.001; // Zeminin biraz üzerinde (z-fighting önlemek için)
    shadowPlane.receiveShadow = true; 
    shadowPlane.name = "ShadowPlane";
    scene.add(shadowPlane);
    console.log("TABLEMODEL.JS: Gölge düzlemi eklendi/güncellendi.");
}

/**
 * Updates the model header with current material and edge style information
 */
function updateModelHeader(currentMaterial, edgeStyle) {
    const edgeLabel = edgeStyle.charAt(0).toUpperCase() + edgeStyle.slice(1);
    // Malzeme ismini MATERIALS objesinden almak daha doğru olabilir (Türkçe isimler için)
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
