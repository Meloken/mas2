/**
 * @file materials.js
 * @description Modern Masa Tasarımcısı uygulaması için malzeme yönetimi modülü
 * Malzeme özelliklerini, dokularını ve renklerini yönetir
 */

// Uygulama durumu global olarak erişilebilir olduğu varsayılıyor (appState.renderer.capabilities.getMaxAnisotropy() için)
// var appState = window.appState; // Eğer main.js'de global appState varsa

const MATERIALS = {
    'ceviz': {
        name: 'Ceviz',
        color: 0x6A4F3B, // Daha koyu ve zengin bir kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/ceviz_wood_texture_dark.jpg' // Örnek yerel doku yolu
        // Alternatif online doku: 'https://www.textures.com/system/gallery/photos/Wood/Planks/New/35366/WoodPlanksNew0007_1_S.jpg'
    },
    'mogano': {
        name: 'Maun',
        color: 0x8C4A3C, // Kırmızımsı kahverengi, biraz daha canlı (Resimdeki gibi)
        textureUrl: 'assets/textures/maun_wood_texture_reddish.jpg'
        // Alternatif online doku: 'https://www.textures.com/system/gallery/photos/Wood/Planks/Clean/20993/WoodPlanksClean0063_1_S.jpg'
    },
    'mese': {
        name: 'Meşe',
        color: 0xC8B59A, // Açık, hafif sarımsı ve desatüre kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/mese_wood_texture_light.jpg'
        // Alternatif online doku: 'https://www.textures.com/system/gallery/photos/Wood/Planks/New/35402/WoodPlanksNew0043_1_S.jpg'
    },
    'huş': {
        name: 'Huş', // Resimde daha koyu ve grimsi bir ton var
        color: 0x9A8C78, // Daha koyu, grimsi kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/hus_wood_texture_greyish.jpg'
        // Alternatif online doku: 'https://www.textures.com/system/gallery/photos/Wood/Planks/Painted/57075/WoodPlanksPainted0017_1_S.jpg' // (Biraz boyalı gibi ama renk tonu yakın)
    },
    'ebene': {
        name: 'Abanoz',
        color: 0x2A2B27, // Çok koyu, siyaha yakın, hafif yeşilimsi/kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/abanoz_wood_texture_dark.jpg'
        // Alternatif online doku: 'https://www.textures.com/system/gallery/photos/Wood/Fine%20Wood/Dark/127983/WoodFineDark0050_1_S.jpg'
    },
    'geyik': {
        name: 'Dişbudak', // (Geyik yerine Dişbudak daha uygun bir ağaç ismi olabilir)
        color: 0x7C6F62, // Orta-koyu, grimsi kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/disbudak_wood_texture_dark_grey.jpg'
        // Alternatif online doku: 'https://www.textures.com/system/gallery/photos/Wood/Planks/Weathered/110800/WoodPlanksWeathered0003_1_S.jpg'
    }
};

/**
 * Belirtilen malzeme adının özelliklerini döndürür.
 * @param {string} materialName - Malzemenin adı (örn: 'ceviz').
 * @returns {object} Malzeme özellikleri (name, color, textureUrl).
 */
function getMaterialProperties(materialName) {
    if (MATERIALS[materialName]) {
        return MATERIALS[materialName];
    }
    console.warn(`MATERIALS.JS: '${materialName}' adlı malzeme bulunamadı. Varsayılan olarak 'ceviz' kullanılıyor.`);
    return MATERIALS['ceviz']; // Varsayılan malzeme
}

/**
 * Belirtilen ada sahip bir Three.js malzemesi oluşturur.
 * @param {string} materialName - Oluşturulacak malzemenin adı.
 * @param {object} [options={}] - Ek malzeme seçenekleri (MeshPhysicalMaterial için).
 * @returns {THREE.MeshPhysicalMaterial} Oluşturulan malzeme.
 */
function createMaterial(materialName, options = {}) {
    console.log(`MATERIALS.JS: Malzeme oluşturuluyor: ${materialName}`);

    const materialProps = getMaterialProperties(materialName);

    const defaults = {
        roughness: 0.65, // Ahşap için pürüzlülük biraz daha artırıldı
        metalness: 0.0,
        reflectivity: 0.25, // Yansıtıcılık biraz daha düşük
        clearcoat: 0.15,
        clearcoatRoughness: 0.35
    };
    const settings = Object.assign({}, defaults, options);

    let finalMaterial;

    if (materialProps.textureUrl) {
        console.log(`MATERIALS.JS: Doku yükleniyor: ${materialProps.textureUrl}`);

        const textureLoader = new THREE.TextureLoader();
        try {
            const texture = textureLoader.load(
                materialProps.textureUrl,
                function (loadedTexture) { // onLoad callback
                    loadedTexture.needsUpdate = true; // Ensure texture updates
                    loadedTexture.wrapS = THREE.RepeatWrapping; // Repeat texture horizontally
                    loadedTexture.wrapT = THREE.RepeatWrapping; // Repeat texture vertically

                    // Anisotropy ayarı (varsa renderer üzerinden)
                    let maxAnisotropy = 16; // Varsayılan değer
                    if (typeof appState !== 'undefined' && appState.renderer && appState.renderer.capabilities) {
                        maxAnisotropy = appState.renderer.capabilities.getMaxAnisotropy();
                    }
                    loadedTexture.anisotropy = maxAnisotropy;
                    loadedTexture.encoding = THREE.sRGBEncoding; // Renk doğruluğu için
                    console.log(`MATERIALS.JS: ${materialProps.textureUrl} dokusu başarıyla yüklendi ve uygulandı. Texture object:`, loadedTexture);

                    // Malzeme zaten oluşturulduysa ve doku sonradan yüklendiyse, malzemeyi güncelle
                    if (finalMaterial && finalMaterial.map !== loadedTexture) {
                        finalMaterial.map = loadedTexture;
                        finalMaterial.needsUpdate = true; // Malzemenin güncellenmesi gerektiğini belirt
                        console.log(`MATERIALS.JS: Malzeme (${materialName}) doku ile güncellendi.`);
                    }
                },
                undefined, // onProgress callback (şimdilik kullanılmıyor)
                function (errorEvent) { // onError callback
                    console.error(`MATERIALS.JS: ${materialProps.textureUrl} dokusu yüklenirken XHR HATA OLUŞTU:`, errorEvent);
                    console.error(`MATERIALS.JS: Lütfen '${materialProps.textureUrl}' dosyasının doğru yolda ('assets/textures/' altında) ve erişilebilir olduğundan emin olun veya çalışan bir online URL kullanın.`);
                    // Doku yüklenemezse, malzemeyi sadece renk ile bırak veya bir hata rengi ata
                    if (finalMaterial) {
                        finalMaterial.map = null; // Doku yok
                        // Hata durumunda kırmızı renk yerine malzemenin kendi rengini kullan:
                        finalMaterial.color.setHex(materialProps.color);
                        finalMaterial.needsUpdate = true;
                        console.warn(`MATERIALS.JS: Doku yükleme hatası nedeniyle ${materialName} malzemesi kendi temel rengiyle (${materialProps.color.toString(16)}) ayarlandı.`);
                    }
                }
            );

            // Malzemeyi doku ile birlikte oluştur (doku yüklenmesi asenkron olabilir)
            finalMaterial = new THREE.MeshPhysicalMaterial(Object.assign({
                map: texture, // Doku atanıyor
                color: materialProps.color // Ana renk de atanıyor (doku yüklenene kadar veya doku ile karışması için)
            }, settings));
            finalMaterial.name = materialName + "_Material"; // Hata ayıklama için isimlendirme
            console.log(`MATERIALS.JS: ${materialName} için MeshPhysicalMaterial oluşturuldu. Doku yüklenmesi bekleniyor...`);

        } catch (e) {
            console.error(`MATERIALS.JS: TextureLoader.load çağrılırken hata (bu genellikle olmaz):`, e);
            // Beklenmedik bir hata durumunda fallback
            finalMaterial = new THREE.MeshPhysicalMaterial(Object.assign({
                color: materialProps.color, // Hata durumunda da kendi rengini kullan
            }, settings));
            finalMaterial.name = materialName + "_ErrorMaterial";
        }

    } else {
        // Doku URL'si yoksa, sadece renkli malzeme oluştur
        console.warn(`MATERIALS.JS: ${materialName} için doku URL'si bulunamadı. Sadece renkli malzeme kullanılıyor.`);
        finalMaterial = new THREE.MeshPhysicalMaterial(Object.assign({
            color: materialProps.color
        }, settings));
        finalMaterial.name = materialName + "_ColorOnlyMaterial";
    }

    finalMaterial.needsUpdate = true; // İlk oluşturmada da güncelleme gerekebilir
    return finalMaterial;
}

/**
 * Metal ayaklar için standart bir Three.js malzemesi oluşturur.
 * @param {number} [color=0x333333] - Metalin rengi (hexadecimal).
 * @returns {THREE.MeshStandardMaterial} Oluşturulan metal malzeme.
 */
function createMetalMaterial(color = 0x333333) { // Varsayılan koyu gri metal
    const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.45, // Metal için biraz daha az pürüzlü
        metalness: 0.85  // Yüksek metaliklik değeri
    });
    mat.name = "MetalLegMaterial";
    return mat;
}

/**
 * Verilen bir rengin daha koyu bir tonunu hesaplar. (Şu an kullanılmıyor olabilir)
 * @param {number} color - Orijinal renk (hexadecimal).
 * @param {number} [factor=0.8] - Koyulaştırma faktörü (0 ile 1 arası).
 * @returns {number} Daha koyu renk (hexadecimal).
 */
function getDarkerShade(color, factor = 0.8) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    const darkerR = Math.floor(r * factor);
    const darkerG = Math.floor(g * factor);
    const darkerB = Math.floor(b * factor);

    return (darkerR << 16) | (darkerG << 8) | darkerB;
}

// Modülün dışa aktarılan fonksiyonları
window.MaterialsModule = {
    getMaterialProperties,
    createMaterial,
    createMetalMaterial,
    getDarkerShade // Bu fonksiyon şu an aktif olarak kullanılmıyor olabilir ama API'de kalabilir.
};
