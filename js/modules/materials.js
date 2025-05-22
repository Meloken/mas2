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
    },
    'mogano': {
        name: 'Maun',
        color: 0x8C4A3C, // Kırmızımsı kahverengi, biraz daha canlı (Resimdeki gibi)
        textureUrl: 'assets/textures/maun_wood_texture_reddish.jpg' 
    },
    'mese': {
        name: 'Meşe',
        color: 0xC8B59A, // Açık, hafif sarımsı ve desatüre kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/mese_wood_texture_light.jpg'
    },
    'huş': {
        name: 'Huş', // Resimde daha koyu ve grimsi bir ton var
        color: 0x9A8C78, // Daha koyu, grimsi kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/hus_wood_texture_greyish.jpg'
    },
    'ebene': {
        name: 'Abanoz',
        color: 0x2A2B27, // Çok koyu, siyaha yakın, hafif yeşilimsi/kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/abanoz_wood_texture_dark.jpg'
    },
    'geyik': { 
        name: 'Dişbudak', 
        color: 0x7C6F62, // Orta-koyu, grimsi kahverengi (Resimdeki gibi)
        textureUrl: 'assets/textures/disbudak_wood_texture_dark_grey.jpg'
    }
};

function getMaterialProperties(materialName) {
    if (MATERIALS[materialName]) {
        return MATERIALS[materialName];
    }
    console.warn(`MATERIALS.JS: '${materialName}' adlı malzeme bulunamadı. Varsayılan olarak 'ceviz' kullanılıyor.`);
    return MATERIALS['ceviz'];
}

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
                function (loadedTexture) { 
                    loadedTexture.needsUpdate = true; 
                    loadedTexture.wrapS = THREE.RepeatWrapping; 
                    loadedTexture.wrapT = THREE.RepeatWrapping; 
                    
                    // appState'in global olup olmadığını kontrol et
                    let maxAnisotropy = 16; // Varsayılan değer
                    if (typeof appState !== 'undefined' && appState.renderer && appState.renderer.capabilities) { 
                        maxAnisotropy = appState.renderer.capabilities.getMaxAnisotropy();
                    }
                    loadedTexture.anisotropy = maxAnisotropy;
                    loadedTexture.encoding = THREE.sRGBEncoding; 
                    console.log(`MATERIALS.JS: ${materialProps.textureUrl} dokusu başarıyla yüklendi ve uygulandı. Texture object:`, loadedTexture);
                    
                    if (finalMaterial && finalMaterial.map !== loadedTexture) {
                        finalMaterial.map = loadedTexture;
                        finalMaterial.needsUpdate = true;
                        console.log(`MATERIALS.JS: Malzeme (${materialName}) doku ile güncellendi.`);
                    }
                },
                undefined, 
                function (errorEvent) { 
                    console.error(`MATERIALS.JS: ${materialProps.textureUrl} dokusu yüklenirken XHR HATA OLUŞTU:`, errorEvent);
                    console.error(`MATERIALS.JS: Lütfen '${materialProps.textureUrl}' dosyasının doğru yolda ('assets/textures/' altında) ve erişilebilir olduğundan emin olun.`);
                    if (finalMaterial) {
                        finalMaterial.map = null; 
                        finalMaterial.color.setHex(0xFF0000); // Kırmızı renk (hata belirtisi)
                        finalMaterial.needsUpdate = true;
                        console.warn(`MATERIALS.JS: Doku yükleme hatası nedeniyle ${materialName} malzemesi kırmızı olarak ayarlandı.`);
                    }
                }
            );
            
            finalMaterial = new THREE.MeshPhysicalMaterial(Object.assign({
                map: texture, 
                color: materialProps.color 
            }, settings));
            finalMaterial.name = materialName + "_Material"; 
            console.log(`MATERIALS.JS: ${materialName} için MeshPhysicalMaterial oluşturuldu. Doku yüklenmesi bekleniyor...`);

        } catch (e) {
            console.error(`MATERIALS.JS: TextureLoader.load çağrılırken hata (bu genellikle olmaz):`, e);
            finalMaterial = new THREE.MeshPhysicalMaterial(Object.assign({
                color: 0x00FF00, 
            }, settings));
            finalMaterial.name = materialName + "_ErrorMaterial";
        }
        
    } else {
        console.warn(`MATERIALS.JS: ${materialName} için doku URL'si bulunamadı. Sadece renkli malzeme kullanılıyor.`);
        finalMaterial = new THREE.MeshPhysicalMaterial(Object.assign({
            color: materialProps.color
        }, settings));
        finalMaterial.name = materialName + "_ColorOnlyMaterial";
    }
    
    finalMaterial.needsUpdate = true; 
    return finalMaterial;
}

function createMetalMaterial(color = 0x333333) { 
    const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.45, // Metal için biraz daha az pürüzlü
        metalness: 0.85  
    });
    mat.name = "MetalLegMaterial";
    return mat;
}

// Bu fonksiyon şu an kullanılmıyor gibi görünüyor, ancak referans olarak kalabilir.
function getDarkerShade(color, factor = 0.8) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    
    const darkerR = Math.floor(r * factor);
    const darkerG = Math.floor(g * factor);
    const darkerB = Math.floor(b * factor);
    
    return (darkerR << 16) | (darkerG << 8) | darkerB;
}

window.MaterialsModule = {
    getMaterialProperties,
    createMaterial,
    createMetalMaterial,
    getDarkerShade 
};
