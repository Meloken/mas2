/**
 * @file dimensionLabels.js
 * @description Canvas içi ölçü etiketleri modülü
 * Masa üzerinde boyut çizgileri ve etiketleri gösterir
 */

// Modül durumu
let dimensionGroup = null;
let isLabelsVisible = true;
let currentDimensions = { width: 109, length: 150, height: 75 };
let labelMeshes = { width: null, length: null, height: null };
let lineMeshes = {
    width: { main: null, leftEnd: null, rightEnd: null },
    length: { main: null, frontEnd: null, backEnd: null },
    height: { main: null, bottomEnd: null, topEnd: null }
};
let currentCamera = null; // Kamera referansı

/**
 * Ölçü etiketlerini oluşturur ve sahneye ekler
 * @param {THREE.Scene} scene - Three.js sahnesi
 * @param {object} dimensions - Masa boyutları {width, length, height} (cm cinsinden)
 * @param {THREE.Camera} camera - Kamera referansı (opsiyonel)
 */
function createDimensionLabels(scene, dimensions, camera = null) {
    // Önceki etiketleri temizle
    disposeDimensionLabels(scene);

    if (!isLabelsVisible) return;

    // Kamera referansını sakla
    if (camera) currentCamera = camera;

    dimensionGroup = new THREE.Group();
    dimensionGroup.name = "DimensionLabels";

    // Boyutları metre cinsine çevir
    const width = dimensions.width / 100;
    const length = dimensions.length / 100;
    const height = dimensions.height / 100;

    // Ölçü çizgilerini ve etiketlerini oluştur
    createWidthDimension(width, length, height, dimensions.width);
    createLengthDimension(width, length, height, dimensions.length);
    createHeightDimension(width, length, height, dimensions.height);

    scene.add(dimensionGroup);
    console.log("DIMENSION_LABELS: Ölçü etiketleri oluşturuldu:", dimensions);
}

/**
 * Genişlik ölçüsü oluşturur (X ekseni)
 */
function createWidthDimension(width, length, height, widthCm) {
    const offset = Math.max(0.15, width * 0.15); // Masa boyutuna orantılı offset
    const lineHeight = Math.max(0.01, width * 0.02); // Orantılı çizgi kalınlığı
    const endLineLength = Math.max(0.03, width * 0.08); // Orantılı uç çizgi uzunluğu

    // Ana ölçü çizgisi (masa üstünde, ön kenar) - masa genişliği kadar
    const lineGeometry = new THREE.BoxGeometry(width, lineHeight, 0.005);
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x6E56CF,
        transparent: true,
        opacity: 0.9
    });
    const mainLine = new THREE.Mesh(lineGeometry, lineMaterial);
    mainLine.position.set(0, height + 0.01, -length/2 - offset);
    lineMeshes.width.main = mainLine; // Referansı sakla
    dimensionGroup.add(mainLine);

    // Uç çizgiler (dikey) - orantılı boyutlarda
    const endLineGeometry = new THREE.BoxGeometry(0.005, lineHeight, endLineLength);
    const leftEndLine = new THREE.Mesh(endLineGeometry, lineMaterial);
    leftEndLine.position.set(-width/2, height + 0.01, -length/2 - offset);
    lineMeshes.width.leftEnd = leftEndLine; // Referansı sakla
    dimensionGroup.add(leftEndLine);

    const rightEndLine = new THREE.Mesh(endLineGeometry, lineMaterial);
    rightEndLine.position.set(width/2, height + 0.01, -length/2 - offset);
    lineMeshes.width.rightEnd = rightEndLine; // Referansı sakla
    dimensionGroup.add(rightEndLine);

    // Boyut etiketi - masa boyutuna orantılı
    const labelSize = Math.max(0.08, width * 0.08);
    const label = createTextLabel(`${widthCm} cm`, labelSize);
    label.position.set(0, height + 0.08, -length/2 - offset);
    labelMeshes.width = label; // Referansı sakla
    dimensionGroup.add(label);
}

/**
 * Uzunluk ölçüsü oluşturur (Z ekseni)
 */
function createLengthDimension(width, length, height, lengthCm) {
    const offset = Math.max(0.15, length * 0.12); // Masa boyutuna orantılı offset
    const lineHeight = Math.max(0.01, length * 0.015); // Orantılı çizgi kalınlığı
    const endLineLength = Math.max(0.03, length * 0.06); // Orantılı uç çizgi uzunluğu

    // Ana ölçü çizgisi (masa üstünde, sağ kenar) - masa uzunluğu kadar
    const lineGeometry = new THREE.BoxGeometry(0.005, lineHeight, length);
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x6E56CF,
        transparent: true,
        opacity: 0.9
    });
    const mainLine = new THREE.Mesh(lineGeometry, lineMaterial);
    mainLine.position.set(width/2 + offset, height + 0.01, 0);
    lineMeshes.length.main = mainLine; // Referansı sakla
    dimensionGroup.add(mainLine);

    // Uç çizgiler (yatay) - orantılı boyutlarda
    const endLineGeometry = new THREE.BoxGeometry(endLineLength, lineHeight, 0.005);
    const frontEndLine = new THREE.Mesh(endLineGeometry, lineMaterial);
    frontEndLine.position.set(width/2 + offset, height + 0.01, -length/2);
    lineMeshes.length.frontEnd = frontEndLine; // Referansı sakla
    dimensionGroup.add(frontEndLine);

    const backEndLine = new THREE.Mesh(endLineGeometry, lineMaterial);
    backEndLine.position.set(width/2 + offset, height + 0.01, length/2);
    lineMeshes.length.backEnd = backEndLine; // Referansı sakla
    dimensionGroup.add(backEndLine);

    // Boyut etiketi - masa boyutuna orantılı
    const labelSize = Math.max(0.08, length * 0.06);
    const label = createTextLabel(`${lengthCm} cm`, labelSize);
    label.position.set(width/2 + offset + 0.08, height + 0.08, 0);
    labelMeshes.length = label; // Referansı sakla
    dimensionGroup.add(label);
}

/**
 * Yükseklik ölçüsü oluşturur (Y ekseni)
 */
function createHeightDimension(width, length, height, heightCm) {
    const offset = Math.max(0.2, Math.max(width, length) * 0.15); // Masa boyutuna orantılı offset
    const lineThickness = Math.max(0.01, height * 0.02); // Orantılı çizgi kalınlığı
    const endLineLength = Math.max(0.03, height * 0.08); // Orantılı uç çizgi uzunluğu

    // Ana ölçü çizgisi (dikey, masa yanında) - masa yüksekliği kadar
    const lineGeometry = new THREE.BoxGeometry(0.005, height, lineThickness);
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x6E56CF,
        transparent: true,
        opacity: 0.9
    });
    const mainLine = new THREE.Mesh(lineGeometry, lineMaterial);
    mainLine.position.set(-width/2 - offset, height/2, -length/2 - offset);
    lineMeshes.height.main = mainLine; // Referansı sakla
    dimensionGroup.add(mainLine);

    // Uç çizgiler (yatay) - orantılı boyutlarda
    const endLineGeometry = new THREE.BoxGeometry(endLineLength, 0.005, lineThickness);
    const bottomEndLine = new THREE.Mesh(endLineGeometry, lineMaterial);
    bottomEndLine.position.set(-width/2 - offset, 0, -length/2 - offset);
    lineMeshes.height.bottomEnd = bottomEndLine; // Referansı sakla
    dimensionGroup.add(bottomEndLine);

    const topEndLine = new THREE.Mesh(endLineGeometry, lineMaterial);
    topEndLine.position.set(-width/2 - offset, height, -length/2 - offset);
    lineMeshes.height.topEnd = topEndLine; // Referansı sakla
    dimensionGroup.add(topEndLine);

    // Boyut etiketi - masa boyutuna orantılı
    const labelSize = Math.max(0.08, height * 0.12);
    const label = createTextLabel(`${heightCm} cm`, labelSize);
    label.position.set(-width/2 - offset - 0.08, height/2, -length/2 - offset);
    labelMeshes.height = label; // Referansı sakla
    dimensionGroup.add(label);
}

/**
 * Metin etiketi oluşturur
 * @param {string} text - Gösterilecek metin
 * @param {number} size - Metin boyutu
 * @returns {THREE.Mesh} Metin mesh'i
 */
function createTextLabel(text, size = 0.15) {
    // Canvas ile metin oluştur
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Canvas boyutları - %50 daha büyük
    canvas.width = 720;
    canvas.height = 180;

    // Arka plan - beyaz, hafif şeffaf
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Border - mor çerçeve
    context.strokeStyle = '#6E56CF';
    context.lineWidth = 6;
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Metin stili - %50 daha büyük
    context.fillStyle = '#6E56CF';
    context.font = 'bold 63px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Metni çiz
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Texture oluştur
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Material ve geometry - %50 daha büyük
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide // Her iki taraftan görünür
    });
    const geometry = new THREE.PlaneGeometry(size * 5.0, size * 1.2);

    const mesh = new THREE.Mesh(geometry, material);

    // Kamera takip özelliği ekle
    mesh.userData.isLabel = true;

    return mesh;
}

/**
 * Ölçü etiketlerini temizler
 * @param {THREE.Scene} scene - Three.js sahnesi
 */
function disposeDimensionLabels(scene) {
    if (dimensionGroup) {
        dimensionGroup.traverse(function(object) {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                }
            }
        });
        scene.remove(dimensionGroup);
        dimensionGroup = null;

        // Referansları temizle
        labelMeshes = { width: null, length: null, height: null };
        lineMeshes = {
            width: { main: null, leftEnd: null, rightEnd: null },
            length: { main: null, frontEnd: null, backEnd: null },
            height: { main: null, bottomEnd: null, topEnd: null }
        };
    }
}

/**
 * Ölçü etiketlerinin görünürlüğünü değiştirir
 * @param {boolean} visible - Görünür olup olmayacağı
 * @param {THREE.Scene} scene - Three.js sahnesi
 * @param {object} dimensions - Masa boyutları
 */
function toggleDimensionLabels(visible, scene, dimensions) {
    isLabelsVisible = visible;
    if (visible && dimensions) {
        createDimensionLabels(scene, dimensions);
    } else {
        disposeDimensionLabels(scene);
    }
}

/**
 * Ölçü etiketlerini günceller
 * @param {THREE.Scene} scene - Three.js sahnesi
 * @param {object} dimensions - Yeni masa boyutları
 */
function updateDimensionLabels(scene, dimensions) {
    if (isLabelsVisible) {
        // Boyutları güncelle
        currentDimensions = { ...dimensions };

        // Sadece etiket metinlerini güncelle (performans için)
        updateLabelTexts();

        // Pozisyonları da güncelle
        updateLabelPositions(dimensions);

        // Çizgileri de güncelle (DİNAMİK ÇİZGİLER)
        updateLineGeometries(dimensions);
    }
}

/**
 * Sadece etiket metinlerini günceller (hızlı güncelleme)
 */
function updateLabelTexts() {
    if (!dimensionGroup || !isLabelsVisible) return;

    // Genişlik etiketi güncelle
    if (labelMeshes.width) {
        updateSingleLabel(labelMeshes.width, `${currentDimensions.width} cm`);
    }

    // Uzunluk etiketi güncelle
    if (labelMeshes.length) {
        updateSingleLabel(labelMeshes.length, `${currentDimensions.length} cm`);
    }

    // Yükseklik etiketi güncelle
    if (labelMeshes.height) {
        updateSingleLabel(labelMeshes.height, `${currentDimensions.height} cm`);
    }
}

/**
 * Tek bir etiketin metnini günceller
 * @param {THREE.Mesh} labelMesh - Güncellenecek etiket mesh'i
 * @param {string} newText - Yeni metin
 */
function updateSingleLabel(labelMesh, newText) {
    if (!labelMesh || !labelMesh.material || !labelMesh.material.map) return;

    // Mevcut canvas'ı al
    const canvas = labelMesh.material.map.image;
    const context = canvas.getContext('2d');

    // Canvas'ı temizle
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Arka plan - beyaz, hafif şeffaf
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Border - mor çerçeve
    context.strokeStyle = '#6E56CF';
    context.lineWidth = 6;
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Yeni metni çiz - %50 daha büyük
    context.fillStyle = '#6E56CF';
    context.font = 'bold 63px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(newText, canvas.width / 2, canvas.height / 2);

    // Texture'ı güncelle
    labelMesh.material.map.needsUpdate = true;
}

/**
 * Etiket pozisyonlarını günceller
 * @param {object} dimensions - Masa boyutları
 */
function updateLabelPositions(dimensions) {
    if (!dimensionGroup || !isLabelsVisible) return;

    const width = dimensions.width / 100;
    const length = dimensions.length / 100;
    const height = dimensions.height / 100;

    // Orantılı offset'ler
    const widthOffset = Math.max(0.15, width * 0.15);
    const lengthOffset = Math.max(0.15, length * 0.12);
    const heightOffset = Math.max(0.2, Math.max(width, length) * 0.15);

    // Genişlik etiketi pozisyonu
    if (labelMeshes.width) {
        labelMeshes.width.position.set(0, height + 0.08, -length/2 - widthOffset);
    }

    // Uzunluk etiketi pozisyonu
    if (labelMeshes.length) {
        labelMeshes.length.position.set(width/2 + lengthOffset + 0.08, height + 0.08, 0);
    }

    // Yükseklik etiketi pozisyonu
    if (labelMeshes.height) {
        labelMeshes.height.position.set(-width/2 - heightOffset - 0.08, height/2, -length/2 - heightOffset);
    }
}

/**
 * Çizgi geometrilerini günceller (DİNAMİK ÇİZGİLER)
 * @param {object} dimensions - Masa boyutları
 */
function updateLineGeometries(dimensions) {
    if (!dimensionGroup || !isLabelsVisible) return;

    const width = dimensions.width / 100;
    const length = dimensions.length / 100;
    const height = dimensions.height / 100;

    // Orantılı değerler
    const widthOffset = Math.max(0.15, width * 0.15);
    const lengthOffset = Math.max(0.15, length * 0.12);
    const heightOffset = Math.max(0.2, Math.max(width, length) * 0.15);

    const widthLineHeight = Math.max(0.01, width * 0.02);
    const lengthLineHeight = Math.max(0.01, length * 0.015);
    const heightLineThickness = Math.max(0.01, height * 0.02);

    const widthEndLineLength = Math.max(0.03, width * 0.08);
    const lengthEndLineLength = Math.max(0.03, length * 0.06);
    const heightEndLineLength = Math.max(0.03, height * 0.08);

    // Genişlik çizgilerini güncelle
    if (lineMeshes.width.main) {
        // Ana çizgi - masa genişliği kadar
        lineMeshes.width.main.geometry.dispose();
        lineMeshes.width.main.geometry = new THREE.BoxGeometry(width, widthLineHeight, 0.005);
        lineMeshes.width.main.position.set(0, height + 0.01, -length/2 - widthOffset);

        // Sol uç çizgi
        lineMeshes.width.leftEnd.geometry.dispose();
        lineMeshes.width.leftEnd.geometry = new THREE.BoxGeometry(0.005, widthLineHeight, widthEndLineLength);
        lineMeshes.width.leftEnd.position.set(-width/2, height + 0.01, -length/2 - widthOffset);

        // Sağ uç çizgi
        lineMeshes.width.rightEnd.geometry.dispose();
        lineMeshes.width.rightEnd.geometry = new THREE.BoxGeometry(0.005, widthLineHeight, widthEndLineLength);
        lineMeshes.width.rightEnd.position.set(width/2, height + 0.01, -length/2 - widthOffset);
    }

    // Uzunluk çizgilerini güncelle
    if (lineMeshes.length.main) {
        // Ana çizgi - masa uzunluğu kadar
        lineMeshes.length.main.geometry.dispose();
        lineMeshes.length.main.geometry = new THREE.BoxGeometry(0.005, lengthLineHeight, length);
        lineMeshes.length.main.position.set(width/2 + lengthOffset, height + 0.01, 0);

        // Ön uç çizgi
        lineMeshes.length.frontEnd.geometry.dispose();
        lineMeshes.length.frontEnd.geometry = new THREE.BoxGeometry(lengthEndLineLength, lengthLineHeight, 0.005);
        lineMeshes.length.frontEnd.position.set(width/2 + lengthOffset, height + 0.01, -length/2);

        // Arka uç çizgi
        lineMeshes.length.backEnd.geometry.dispose();
        lineMeshes.length.backEnd.geometry = new THREE.BoxGeometry(lengthEndLineLength, lengthLineHeight, 0.005);
        lineMeshes.length.backEnd.position.set(width/2 + lengthOffset, height + 0.01, length/2);
    }

    // Yükseklik çizgilerini güncelle
    if (lineMeshes.height.main) {
        // Ana çizgi - masa yüksekliği kadar
        lineMeshes.height.main.geometry.dispose();
        lineMeshes.height.main.geometry = new THREE.BoxGeometry(0.005, height, heightLineThickness);
        lineMeshes.height.main.position.set(-width/2 - heightOffset, height/2, -length/2 - heightOffset);

        // Alt uç çizgi
        lineMeshes.height.bottomEnd.geometry.dispose();
        lineMeshes.height.bottomEnd.geometry = new THREE.BoxGeometry(heightEndLineLength, 0.005, heightLineThickness);
        lineMeshes.height.bottomEnd.position.set(-width/2 - heightOffset, 0, -length/2 - heightOffset);

        // Üst uç çizgi
        lineMeshes.height.topEnd.geometry.dispose();
        lineMeshes.height.topEnd.geometry = new THREE.BoxGeometry(heightEndLineLength, 0.005, heightLineThickness);
        lineMeshes.height.topEnd.position.set(-width/2 - heightOffset, height, -length/2 - heightOffset);
    }
}

/**
 * Etiketleri kameraya yönlendirir (her frame'de çağrılmalı)
 * @param {THREE.Camera} camera - Kamera referansı
 */
function updateLabelOrientations(camera) {
    if (!dimensionGroup || !isLabelsVisible || !camera) return;

    // Kamera referansını güncelle
    currentCamera = camera;

    // Tüm etiketleri kameraya yönlendir
    dimensionGroup.traverse(function(object) {
        if (object.userData && object.userData.isLabel) {
            // Etiketin pozisyonunu al
            const labelPosition = object.position.clone();

            // Kamera pozisyonunu al
            const cameraPosition = camera.position.clone();

            // Etiketin kameraya bakmasını sağla - TERSİNİ YAP
            object.lookAt(cameraPosition);

            // Yazının düz olması için döndürme yapma (rotateY kaldırıldı)
            // object.rotateY(Math.PI); // Bu satır kaldırıldı
        }
    });
}

/**
 * Kamera referansını ayarlar
 * @param {THREE.Camera} camera - Kamera referansı
 */
function setCamera(camera) {
    currentCamera = camera;
}

// Modül export'u
window.DimensionLabelsModule = {
    createDimensionLabels,
    disposeDimensionLabels,
    toggleDimensionLabels,
    updateDimensionLabels,
    updateLabelOrientations,
    setCamera
};

console.log("DIMENSION_LABELS: Modül yüklendi");
