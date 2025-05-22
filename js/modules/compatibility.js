/**
 * @file compatibility.js
 * @description Browser compatibility module for the Modern Table Designer application
 * Handles WebGL detection and provides polyfills for older browsers
 */

/**
 * Checks if WebGL is available in the current browser
 * @returns {boolean} True if WebGL is supported, false otherwise
 */
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

/**
 * Displays a warning when WebGL is not supported
 * Creates and adds a DOM element with a warning message to the target container
 */
function showWebGLWarning() {
    var container = document.getElementById('table-3d-canvas');
    if (!container) return;
    
    // Create warning message element
    var warningEl = document.createElement('div');
    warningEl.className = 'webgl-warning';
    warningEl.innerHTML = `
        <div class="webgl-warning-content">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #facc15; margin-bottom: 1rem;"></i>
            <h3>WebGL Desteklenmiyor</h3>
            <p>Tarayıcınız 3D görüntüleme için gerekli olan WebGL teknolojisini desteklemiyor.</p>
            <p>Lütfen modern bir tarayıcı kullanın (Chrome, Firefox, Edge, Safari).</p>
        </div>
    `;
    container.appendChild(warningEl);
    
    // Add styles for warning
    var style = document.createElement('style');
    style.textContent = `
        .webgl-warning {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(30, 30, 36, 0.9);
            z-index: 100;
        }
        .webgl-warning-content {
            background: var(--bg-primary);
            border: 1px solid var(--accent-primary);
            border-radius: 10px;
            padding: 2rem;
            text-align: center;
            max-width: 80%;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Checks for basic browser compatibility and shows appropriate warnings
 */
function checkBrowserCompatibility() {
    // Check for basic ES5 features
    if (!window.Promise) {
        alert('Bu tarayıcı modern web teknolojilerini desteklemiyor. Lütfen Chrome, Firefox, Safari veya Edge tarayıcısı kullanınız.');
    }
    
    return {
        webGLSupported: isWebGLAvailable()
    };
}

// Export the module's public API
window.CompatibilityModule = {
    check: checkBrowserCompatibility,
    showWebGLWarning: showWebGLWarning
};