/**
 * @file materials.js
 * @description Materials management module for the Modern Table Designer application
 * Handles material properties, textures and colors
 */

/**
 * The collection of available material properties and textures
 * @type {Object}
 */
const MATERIALS = {
    'ceviz': {
        name: 'Ceviz',
        color: 0xD7954B,
        textureUrl: 'https://cdn.pixabay.com/photo/2017/02/07/09/02/wood-2045379_640.jpg'
    },
    'mogano': {
        name: 'Maun',
        color: 0x8B4513, // Dark reddish-brown
        textureUrl: 'https://cdn.pixabay.com/photo/2016/11/21/17/57/wood-1846849_640.jpg'
    },
    'mese': {
        name: 'Meşe',
        color: 0xDEB887, // Burlywood
        textureUrl: 'https://cdn.pixabay.com/photo/2016/11/23/15/04/wood-1853403_640.jpg'
    },
    'huş': {
        name: 'Huş',
        color: 0xF5DEB3, // Wheat
        textureUrl: 'https://cdn.pixabay.com/photo/2017/02/14/09/02/wood-2065366_640.jpg'
    },
    'ebene': {
        name: 'Abanoz',
        color: 0x3D2B1F, // Very dark brown
        textureUrl: 'https://cdn.pixabay.com/photo/2016/11/21/18/14/wall-1846965_640.jpg'
    },
    'geyik': {
        name: 'Dişbudak',
        color: 0xc4ac90, // Light brown
        textureUrl: 'https://cdn.pixabay.com/photo/2017/02/07/09/02/wood-2045380_640.jpg'
    }
};

/**
 * Gets the properties of a specific material
 * @param {string} materialName - The name of the material
 * @returns {Object} Object containing color and textureUrl properties
 */
function getMaterialProperties(materialName) {
    if (MATERIALS[materialName]) {
        return MATERIALS[materialName];
    }
    
    // Default to ceviz if material not found
    return MATERIALS['ceviz'];
}

/**
 * Creates a Three.js material with appropriate texture and properties
 * @param {string} materialName - The name of the material to use
 * @param {Object} [options] - Additional material options
 * @returns {THREE.Material} The created material object
 */
function createMaterial(materialName, options = {}) {
    console.log("Creating material for: " + materialName);
    
    // Reset THREE.Cache to prevent texture caching issues
    THREE.Cache.clear();
    
    const materialProps = getMaterialProperties(materialName);
    console.log("Material properties:", materialProps);
    
    // Emphasize color differences between materials
    const materialColor = materialProps.color;
    
    const defaults = {
        roughness: 0.4,
        metalness: 0.1,
        reflectivity: 0.3,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3
    };
    
    const settings = Object.assign({}, defaults, options);
    
    // Create material with texture if available
    if (materialProps.textureUrl) {
        console.log("Loading texture from URL:", materialProps.textureUrl);
        
        // Create a new texture loader each time to avoid caching issues
        const textureLoader = new THREE.TextureLoader();
        
        // First destroy any existing texture with same URL
        const textureCache = THREE.Cache.get(materialProps.textureUrl);
        if (textureCache) {
            THREE.Cache.remove(materialProps.textureUrl);
        }
        
        // Force bypass cache by setting needsUpdate on texture load
        const texture = textureLoader.load(materialProps.textureUrl, function(loadedTexture) {
            loadedTexture.needsUpdate = true;
        });
        
        // Set texture wrapping and repeat
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        // Create a unique material each time to avoid caching
        const material = new THREE.MeshPhysicalMaterial(Object.assign({
            map: texture,
            color: materialProps.color
        }, settings));
        
        // Force the material to update
        material.needsUpdate = true;
        material.map.needsUpdate = true;
        
        // Apply material color more strongly
        material.color.setHex(materialProps.color);
        
        // Increase color influence for stronger material colors
        material.color.convertSRGBToLinear(); // Make colors more vibrant
        
        // Add a color tint to the texture
        if (material.map) {
            material.map.encoding = THREE.sRGBEncoding;
            // Increase texture contrast
            material.map.anisotropy = 16; // Sharper texture
        }
        
        console.log("Created material with color:", 
                    material.color.getHexString(), 
                    "from material color:", 
                    materialProps.color.toString(16));
        
        return material;
    } 
    
    // Fallback to color-only material with forced color update
    const material = new THREE.MeshPhysicalMaterial(Object.assign({
        color: materialProps.color
    }, settings));
    
    // Force color update
    material.color.setHex(materialProps.color);
    material.needsUpdate = true;
    
    console.log("Created color-only material with color:", 
                material.color.getHexString());
    
    return material;
}

/**
 * Creates a standard metal material for table legs
 * @param {number} [color=0x222222] - The color of the metal
 * @returns {THREE.Material} The created metal material
 */
function createMetalMaterial(color = 0x222222) {
    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.8
    });
}

/**
 * Gets a darker shade of a color
 * @param {number} color - The color to darken (hex number)
 * @param {number} [factor=0.8] - The darkening factor (0-1)
 * @returns {number} The darkened color
 */
function getDarkerShade(color, factor = 0.8) {
    // Convert hex to RGB, reduce brightness by factor
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    
    const darkerR = Math.floor(r * factor);
    const darkerG = Math.floor(g * factor);
    const darkerB = Math.floor(b * factor);
    
    // Convert back to hex
    return (darkerR << 16) | (darkerG << 8) | darkerB;
}

// Export the module's public API
window.MaterialsModule = {
    getMaterialProperties,
    createMaterial,
    createMetalMaterial,
    getDarkerShade
};