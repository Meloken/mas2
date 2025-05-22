/**
 * @file controls.js
 * @description Camera and UI controls module for the Modern Table Designer application
 * Handles all user interactions with the 3D view
 */

// Module state
let camera, controls;
let zoomLevel = 5;

/**
 * Initializes the camera controls
 * @param {THREE.Camera} sceneCamera - The Three.js camera to control
 * @param {THREE.Renderer} renderer - The Three.js renderer
 * @returns {THREE.OrbitControls} The created controls
 */
function initControls(sceneCamera, renderer) {
    camera = sceneCamera;
    
    // Create and configure OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5; // Slow autorotation to showcase the table
    
    // Initialize UI controls
    initUIControls();
    
    return controls;
}

/**
 * Updates the controls on animation frame
 */
function update() {
    if (controls) {
        controls.update();
    }
}

/**
 * Initializes all UI control elements
 * @private
 */
function initUIControls() {
    initRotationControls();
    initViewControls();
    initZoomControls();
}

/**
 * Initializes the rotation control buttons
 * @private
 */
function initRotationControls() {
    document.querySelectorAll('.control-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var direction = btn.dataset.rotate;
            
            if (!controls) return;
            
            switch (direction) {
                case 'left':
                    rotateTable(-0.3, 0);
                    break;
                case 'right':
                    rotateTable(0.3, 0);
                    break;
                case 'up':
                    rotateTable(0, -0.2);
                    break;
                case 'down':
                    rotateTable(0, 0.2);
                    break;
                case 'reset':
                    resetTableView();
                    break;
            }
        });
    });
}

/**
 * Initializes the view control buttons
 * @private
 */
function initViewControls() {
    document.querySelectorAll('.view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var view = btn.dataset.view;
            
            if (!controls) return;
            
            // Remove active class from all view buttons
            document.querySelectorAll('.view-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            switch(view) {
                case 'perspective':
                    setPerspectiveView();
                    break;
                case 'top':
                    setTopView();
                    break;
                case 'side':
                    setSideView();
                    break;
            }
        });
    });
}

/**
 * Initializes the zoom control slider and buttons
 * @private
 */
function initZoomControls() {
    const zoomSlider = document.getElementById('zoom-slider');
    
    if (zoomSlider) {
        zoomSlider.addEventListener('input', function() {
            zoomLevel = parseInt(zoomSlider.value);
            updateZoom();
        });
    }
    
    document.querySelectorAll('.zoom-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var zoomType = btn.dataset.zoom;
            
            if (zoomType === 'in' && zoomLevel < 10) {
                zoomLevel += 1;
            } else if (zoomType === 'out' && zoomLevel > 2) {
                zoomLevel -= 1;
            }
            
            if (zoomSlider) {
                zoomSlider.value = zoomLevel;
            }
            
            updateZoom();
        });
    });
}

/**
 * Updates the camera zoom based on zoom level
 * @private
 */
function updateZoom() {
    if (!camera || !controls) return;
    
    // Set camera distance based on zoom level (inverse - higher value = closer)
    var distance = 12 - zoomLevel;
    var currentDirection = new THREE.Vector3();
    currentDirection.subVectors(camera.position, controls.target).normalize();
    
    camera.position.copy(currentDirection.multiplyScalar(distance));
    controls.update();
}

/**
 * Rotates the table view by the specified amounts
 * @param {number} deltaY - Rotation amount around Y axis
 * @param {number} deltaX - Rotation amount around X axis
 */
function rotateTable(deltaY, deltaX) {
    if (!controls) return;
    
    controls.rotateLeft(deltaY);
    controls.rotateUp(deltaX);
    controls.update();
}

/**
 * Resets the table view to default perspective
 */
function resetTableView() {
    if (!camera || !controls) return;
    
    // Set camera position for rectangular table
    camera.position.set(3, 2.8, 3);
    camera.lookAt(0, 0, 0);
    
    controls.update();
}

/**
 * Sets the view to a perspective angle
 */
function setPerspectiveView() {
    if (!camera || !controls) return;
    
    // Set camera position for rectangular table
    camera.position.set(3, 2.8, 3);
    camera.lookAt(0, 0, 0);
    
    controls.update();
}

/**
 * Sets the view to top-down
 */
function setTopView() {
    if (!camera || !controls) return;
    
    // Set top view for rectangular table
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);
    
    controls.update();
}

/**
 * Sets the view to the side
 */
function setSideView() {
    if (!camera || !controls) return;
    
    // Set side view for rectangular table
    camera.position.set(4, 0.5, 0);
    camera.lookAt(0, 0, 0);
    
    controls.update();
}

/**
 * Handles window resize events
 * @param {Element} container - The container element
 */
function handleResize(container) {
    if (!camera || !container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

// Export the module's public API
window.ControlsModule = {
    init: initControls,
    update,
    rotateTable,
    resetTableView,
    setPerspectiveView,
    setTopView,
    setSideView,
    handleResize
};