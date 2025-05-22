/**
 * @file main.js
 * @description Main entry point for the Modern Table Designer application
 * Initializes all modules and manages application state
 */

// Application state
var appState = {
    tableWidth: 109, // Default dimensions (cm)
    tableLength: 150,
    tableHeight: 75,
    tableThickness: 3, // Default thickness (cm)
    currentMaterial: 'ceviz',
    edgeStyle: 'straight',
    legStyle: 'standard', // Can be 'standard' or 'u-shape'
    scene: null,
    renderer: null,
    camera: null,
    controls: null
};

/**
 * Initializes the Three.js scene and all related components
 */
function initThreeJS() {
    // Check browser compatibility first
    var compatibility = window.CompatibilityModule.check();
    if (!compatibility.webGLSupported) {
        window.CompatibilityModule.showWebGLWarning();
        return;
    }
    
    // Get container
    var container = document.getElementById('table-3d-canvas');
    
    // Create scene
    appState.scene = new THREE.Scene();
    appState.scene.background = new THREE.Color(0x1e1e24);
    
    // Create camera
    appState.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    appState.camera.position.set(3, 2.8, 3); // Better position for full table view
    appState.camera.lookAt(0, 0, 0); // Look at center of table
    
    // Create renderer with error handling
    try {
        appState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        appState.renderer.setSize(container.clientWidth, container.clientHeight);
        appState.renderer.shadowMap.enabled = true;
        appState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(appState.renderer.domElement);
    } catch (e) {
        console.error("WebGL rendering error:", e);
        window.CompatibilityModule.showWebGLWarning();
        return; // Exit initialization if renderer fails
    }
    
    // Add lights
    addLights();
    
    // Initialize controls
    appState.controls = window.ControlsModule.init(appState.camera, appState.renderer);
    
    // Show loading animation
    document.querySelector('.model-loading').classList.add('active');
    
    // Create default table model
    updateTableModel();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Creates and adds lights to the scene
 */
function addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased intensity
    appState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Increased intensity
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    appState.scene.add(directionalLight);

    // Add a soft fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4); // Increased intensity
    fillLight.position.set(-5, 3, -7.5);
    appState.scene.add(fillLight);
    
    // Add additional light to better show the table
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.3);
    frontLight.position.set(0, 2, 5);
    appState.scene.add(frontLight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    if (appState.controls) {
        window.ControlsModule.update();
    }
    appState.renderer.render(appState.scene, appState.camera);
}

/**
 * Handles window resize events
 */
function onWindowResize() {
    const container = document.getElementById('table-3d-canvas');
    window.ControlsModule.handleResize(container);
    appState.renderer.setSize(container.clientWidth, container.clientHeight);
}

/**
 * Updates the 3D table model with current settings
 */
function updateTableModel() {
    // Create configuration object
    var config = {
        width: appState.tableWidth,
        length: appState.tableLength,
        height: appState.tableHeight,
        thickness: appState.tableThickness,
        material: appState.currentMaterial,
        edgeStyle: appState.edgeStyle,
        legStyle: appState.legStyle
    };
    
    console.log("Updating table model with material:", appState.currentMaterial);
    
    // Create table with current configuration
    window.TableModelModule.createTable(config, appState.scene);
    
    // Update model header
    window.TableModelModule.updateModelHeader(appState.currentMaterial, appState.edgeStyle);
    
    // Update dimensions label
    window.UtilsModule.updateDimensionsLabel(appState.tableWidth, appState.tableLength);
}

/**
 * Initializes all UI event listeners
 */
function initEventListeners() {
    // Material selection
    document.querySelectorAll('.material-item').forEach(function(item) {
        item.addEventListener('click', function() {
            // Remove selected class from all items
            document.querySelectorAll('.material-item').forEach(function(i) {
                i.classList.remove('selected');
            });
            
            // Add selected class to clicked item
            item.classList.add('selected');
            
            // Get material type from class
            var classes = item.classList;
            for (const className of classes) {
                if (className.startsWith('material-')) {
                    appState.currentMaterial = className.replace('material-', '');
                    break;
                }
            }
            
            // Update table model and pricing
            updateTableModel();
            window.UtilsModule.updatePricing();
        });
    });
    
    // Dimension sliders
    document.querySelectorAll('input[type="range"]').forEach(function(slider) {
        slider.addEventListener('input', function() {
            var dimension = slider.dataset.dimension;
            var value = parseFloat(slider.value);
            var valueDisplay = slider.closest('.dimension-row').querySelector('.dimension-value');
            
            // Update the display value
            if (dimension === 'thickness' && value < 1) {
                // Convert to mm for small thickness values
                valueDisplay.textContent = (value * 10) + ' mm';
            } else {
                valueDisplay.textContent = value + ' cm';
            }
            
            // Update dimensions variable
            switch(dimension) {
                case 'width':
                    appState.tableWidth = value;
                    break;
                case 'length':
                    appState.tableLength = value;
                    break;
                case 'height':
                    appState.tableHeight = value;
                    break;
                case 'thickness':
                    appState.tableThickness = value;
                    break;
            }
            
            // Update the table model
            updateTableModel();
            
            // Update pricing
            window.UtilsModule.updatePricing();
        });
    });
    
    // Style options
    document.querySelectorAll('.style-option').forEach(function(option) {
        option.addEventListener('click', function() {
            // Get the group of options this belongs to
            var group = option.parentElement;
            
            // Remove selected class from all options in this group
            group.querySelectorAll('.style-option').forEach(function(opt) {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update style variables based on the data attribute
            if (option.hasAttribute('data-edge')) {
                appState.edgeStyle = option.dataset.edge;
            } else if (option.hasAttribute('data-leg')) {
                appState.legStyle = option.dataset.leg;
            }
            
            // Apply style changes to 3D model
            updateTableModel();
            
            // Update pricing
            window.UtilsModule.updatePricing();
        });
    });
    
    // Features checkboxes
    document.querySelectorAll('.feature-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            window.UtilsModule.updatePricing();
        });
    });
}

/**
 * Main initialization function called when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Loading animation
    var loadingScreen = document.querySelector('.loading-screen');
    
    // Check browser compatibility
    var compatibility = window.CompatibilityModule.check();
    
    // Show WebGL warning if not supported
    if (!compatibility.webGLSupported) {
        window.CompatibilityModule.showWebGLWarning();
        // Still allow UI to load without 3D features
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
        return;
    }
    
    // Simulate loading time for UI elements
    setTimeout(function() {
        loadingScreen.classList.add('hidden');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // Initialize Three.js scene
    initThreeJS();
    
    // Initialize all event listeners
    initEventListeners();
    
    // Initialize scroll reveal animations
    window.UtilsModule.initScrollReveal();
    
    // Initialize pricing
    window.UtilsModule.updatePricing();
});