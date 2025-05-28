# Masa Kraft - 3D Table Customizer

Masa Kraft is an interactive web application that allows users to design their own custom tables and visualize them in a dynamic 3D environment. Users can select and modify various aspects of their table, including dimensions (width, length, height, thickness), colors, materials (for informational purposes), edge styles, and leg styles. The application provides a real-time 3D preview of the customized table, along with an updated pricing summary based on the selected options.

---

## Table of Contents

1.  [Project Structure and File Descriptions](#project-structure-and-file-descriptions)
2.  [Application State (`appState`) Documentation](#appstate-object-documentation)
3.  [Core Functions Documentation (`js/main.js`)](#core-functions-documentation-jsmainjs)
4.  [JavaScript Modules Documentation (`js/modules/`)](#javascript-modules-documentation-jsmodules)
5.  [Application Flow: From User Interaction to UI Update](#application-flow-from-user-interaction-to-ui-update)

---

## Project Structure and File Descriptions

This project is a web-based 3D table customizer application. It allows users to design a table by selecting various options like dimensions, materials, colors, edge styles, and leg styles, and then visualize the customized table in a 3D preview window.

### Main Files and Directories:

*   **`index.html`**:
    *   This is the main entry point of the application.
    *   It defines the overall structure of the web page, including:
        *   A loading screen.
        *   A header section with the project title, a short description, and social media links.
        *   A main content area (`<main id="customizer">`) divided into two main panels:
            *   **Preview Container (`<div class="preview-container">`)**: Displays the 3D table model. It includes:
                *   A top control bar with model information (name, dimensions) and action buttons (auto-rotate, download screenshot).
                *   The 3D canvas (`<div id="table-3d-canvas">`) where the Three.js rendering occurs.
                *   A control panel below the canvas for view manipulation (reset view, toggle dimensions, switch between 3D/top/side views) and zoom controls.
            *   **Customization Panel (`<div class="customization-panel">`)**: Contains various sections for users to customize the table:
                *   Color selection.
                *   Material information display.
                *   Dimension controls (width, length, height, thickness) using sliders and number inputs.
                *   Edge style selection.
                *   Leg style selection.
                *   Additional features (checkboxes for premium finish, glass top, metal details).
                *   A pricing summary that updates based on selections.
                *   An "Order" button.
    *   It includes links to:
        *   The main stylesheet (`css/styles.css`).
        *   External libraries like Font Awesome for icons and Three.js for 3D rendering.
        *   The application's JavaScript files, including `js/main.js` and all modules within `js/modules/`.

*   **`css/styles.css`**:
    *   This file contains all the CSS rules for styling the application.
    *   It implements a modern, dark-mode design with purple and pink accent colors.
    *   Key styling aspects include:
        *   Global styles (font, background, color scheme defined via CSS variables).
        *   Loading screen animation.
        *   Header layout and typography.
        *   Layout of the main container using CSS Grid, separating the preview and customization panels.
        *   Styling for the 3D preview window, control bars, buttons, and icons.
        *   Styling for all customization panel sections: color pickers, material selection grids, dimension sliders and inputs, style option buttons, feature checkboxes, and pricing summary.
        *   Responsive design using media queries to adapt the layout for different screen sizes (tablets and mobile devices).
        *   Animation effects for UI elements (fade-ins, slide-ins, hover effects).
        *   Styling for WebGL compatibility warnings.

*   **`js/main.js`**:
    *   This is the main JavaScript file that orchestrates the application's logic.
    *   It manages the global application state (`appState`), which includes table dimensions, current material, color, styles, and Three.js scene objects.
    *   **Key functionalities:**
        *   **`initThreeJS()`**: Initializes the Three.js scene, camera, renderer, lights, and orbit controls. It also checks for WebGL compatibility using `CompatibilityModule`.
        *   **`addLights()`**: Sets up ambient, directional, fill, and front lights for the 3D scene.
        *   **`onWindowResize()`**: Handles browser window resizing to update the camera aspect ratio and renderer size.
        *   **`updateTableModel()`**: Updates the 3D table model based on the current `appState`. It calls `TableModelModule.createTable()` to generate the table geometry and applies materials. It also updates dimension labels and the model header.
        *   **`toggleAutoRotate()`**: Toggles the automatic rotation of the 3D model.
        *   **`downloadScreenshot()`**: Captures and downloads a PNG screenshot of the current 3D view.
        *   **`animate()`**: The main animation loop that renders the scene and updates controls.
        *   **`initEventListeners()`**: Sets up all event listeners for user interactions:
            *   Color selection.
            *   Material information display (note: this seems to be for display only and doesn't directly change the 3D model's material in the current setup, as color is used for that).
            *   Dimension slider and input changes.
            *   Edge and leg style selections.
            *   Feature checkbox changes.
            *   "Complete Order" button click.
            *   Play/Pause auto-rotate button.
            *   Download screenshot button.
            *   Toggle dimensions visibility button.
        *   The script waits for the DOM to be fully loaded before initializing the application, including the 3D scene, event listeners, scroll reveal animations, and initial pricing updates.

*   **`js/modules/` Directory**:
    *   This directory contains various JavaScript modules, each responsible for a specific part of the application's functionality. This modular approach helps in organizing the code and separating concerns.
    *   **`js/modules/compatibility.js`**:
        *   Checks for browser compatibility, specifically WebGL support.
        *   Provides a function to display a warning message if WebGL is not supported or fails to initialize.
    *   **`js/modules/controls.js`**:
        *   Initializes and manages the Three.js `OrbitControls` for camera manipulation (orbit, zoom, pan) in the 3D preview.
        *   Likely handles user input for camera view changes (perspective, top, side) and zoom slider adjustments.
    *   **`js/modules/dimensionLabels.js`**:
        *   Responsible for creating, updating, and managing the visibility of dimension labels (width, length, height) displayed on the 3D table model.
        *   Ensures labels are correctly oriented towards the camera.
    *   **`js/modules/materials.js`**:
        *   Likely defines and manages the materials (textures, colors, properties) available for the table.
        *   Provides functions to apply these materials to the 3D model. *(Note: `main.js` currently uses `appState.currentColor` for the table's visual appearance, so this module might be more focused on defining material properties or future texture support.)*
    *   **`js/modules/tableModel.js`**:
        *   This is a crucial module responsible for generating the 3D geometry of the table based on the provided configuration (dimensions, edge style, leg style).
        *   It creates the table top and legs as Three.js `Mesh` objects.
        *   Applies the selected color/material to the table components.
        *   Handles disposing of old models when the table is updated.
        *   Updates the model information in the header (e.g., material name, edge style).
    *   **`js/modules/utils.js`**:
        *   A utility module containing helper functions used across the application.
        *   Likely includes functions for:
            *   Throttling and debouncing events (used for dimension slider updates).
            *   Updating the dimensions label in the UI.
            *   Calculating and updating the pricing summary.
            *   Initializing scroll reveal animations for UI elements.

*   **`js/script.js`**:
    *   The `ls()` output shows this file, but `index.html` does not include it. It might be an unused or deprecated file.

This structure allows for a separation of concerns, making the codebase more manageable and scalable. The `index.html` file provides the skeleton, `styles.css` handles the appearance, `main.js` acts as the central controller, and the `js/modules/` directory encapsulates specific functionalities.

---

## appState Object Documentation

The `appState` object, found in `js/main.js`, serves as the central repository for global state information within the Modern Table Designer application. It holds various properties that define the current configuration of the table being designed, as well as references to core Three.js components and UI states.

Below is a detailed description of each property within the `appState` object:

---

### `tableWidth`
*   **Default Value**: `109`
*   **Purpose**: Stores the current selected width of the table top in centimeters.
*   **Effect on Application**:
    *   This value is used by the `TableModelModule` to generate or update the 3D table model with the specified width.
    *   It's displayed in the "Ölçüler" (Dimensions) section of the customization panel and can be modified by the user via a range slider or a number input.
    *   The `DimensionLabelsModule` uses this value to display the width label on the 3D model.
    *   It affects the pricing calculation in `UtilsModule.updatePricing()`.
    *   The model subtitle in the preview window (e.g., "109×150 cm") is updated via `UtilsModule.updateDimensionsLabel()`.

---

### `tableLength`
*   **Default Value**: `150`
*   **Purpose**: Stores the current selected length (or depth) of the table top in centimeters.
*   **Effect on Application**:
    *   This value is used by the `TableModelModule` to generate or update the 3D table model with the specified length.
    *   It's displayed in the "Ölçüler" (Dimensions) section and can be modified by the user.
    *   The `DimensionLabelsModule` uses this value to display the length label on the 3D model.
    *   It affects the pricing calculation.
    *   The model subtitle in the preview window is updated.

---

### `tableHeight`
*   **Default Value**: `75`
*   **Purpose**: Stores the current selected height of the table (from the floor to the top surface) in centimeters.
*   **Effect on Application**:
    *   Used by `TableModelModule` to set the height of the 3D table model, affecting the leg height and overall table position.
    *   It's displayed in the "Ölçüler" (Dimensions) section and can be modified by the user.
    *   The `DimensionLabelsModule` uses this value to display the height label on the 3D model.
    *   It can influence pricing.

---

### `tableThickness`
*   **Default Value**: `3`
*   **Purpose**: Stores the current selected thickness of the table top in centimeters.
*   **Effect on Application**:
    *   Used by `TableModelModule` to define the thickness of the table top in the 3D model.
    *   It's displayed in the "Ölçüler" (Dimensions) section ("Yüzey Kalınlığı") and can be modified by the user.
    *   It can influence pricing.

---

### `currentMaterial`
*   **Default Value**: `'ceviz'`
*   **Purpose**: This property seems to be a remnant or intended for a more complex material system (perhaps involving textures). The comment "geriye uyumluluk için" (for backward compatibility) suggests it might have been superseded by `currentColor` for the primary visual aspect.
*   **Effect on Application**:
    *   It's passed to `TableModelModule.createTable()` within the `config` object. The module might use this for specific material properties if implemented, but the primary visual change (color) is driven by `currentColor`.
    *   The `TableModelModule.updateModelHeader()` function uses this to display the material name in the preview header.
    *   It's also part of the data collected when the "Siparişi Tamamla" (Complete Order) button is clicked.

---

### `currentColor`
*   **Default Value**: `'#654321'` (a brown color)
*   **Purpose**: Stores the currently selected hexadecimal color code for the table. This is the primary property determining the visual color of the 3D table model.
*   **Effect on Application**:
    *   When a color is selected in the "Renk Seçimi" (Color Selection) panel, this property is updated.
    *   The `updateTableModel()` function is called, which in turn uses `TableModelModule` to apply this color to the 3D table model.
    *   The selected color is visually indicated in the UI.

---

### `currentColorName`
*   **Default Value**: `'Koyu Kahverengi'` (Dark Brown)
*   **Purpose**: Stores the human-readable name of the currently selected color.
*   **Effect on Application**:
    *   Updated alongside `currentColor` when a color is selected.
    *   Used for display purposes, potentially in console logs or if tooltips/UI elements were to show the color name.
    *   It's logged to the console when a color is selected.

---

### `currentMaterialInfo`
*   **Default Value**: `'ceviz'`
*   **Purpose**: Stores the identifier of the material selected in the "Malzeme Bilgisi" (Material Information) section of the UI. This selection is for informational purposes and does not directly change the 3D model's appearance in the current implementation (color is handled by `currentColor`).
*   **Effect on Application**:
    *   When a material is clicked in the "Malzeme Bilgisi" grid, this property is updated.
    *   It does *not* trigger an update of the 3D table model's visual material directly; it's meant to provide information to the user.
    *   The selected material info is logged to the console.

---

### `currentMaterialName`
*   **Default Value**: `'Ceviz'` (Walnut)
*   **Purpose**: Stores the human-readable name of the material selected in the "Malzeme Bilgisi" section.
*   **Effect on Application**:
    *   Updated alongside `currentMaterialInfo`.
    *   Used for display purposes (e.g., console logging).

---

### `edgeStyle`
*   **Default Value**: `'straight'`
*   **Purpose**: Stores the currently selected edge style for the table top (e.g., 'straight', 'beveled', 'rounded').
*   **Effect on Application**:
    *   When an edge style is selected in the "Kenar Stili" (Edge Style) panel, this property is updated.
    *   The `TableModelModule` uses this value to generate the table top with the corresponding edge geometry in the 3D model.
    *   `TableModelModule.updateModelHeader()` uses this to display the edge style in the preview header.
    *   It's part of the data collected upon order completion.
    *   It can influence pricing.

---

### `legStyle`
*   **Default Value**: `'standard'`
*   **Purpose**: Stores the currently selected style for the table legs (e.g., 'standard', 'u-shape', 'x-shape', 'v-shape', 'a-shape', 'l-shape').
*   **Effect on Application**:
    *   When a leg style is selected in the "Ayak Stili" (Leg Style) panel, this property is updated.
    *   The `TableModelModule` uses this value to generate the appropriate leg geometry for the 3D table model.
    *   It's part of the data collected upon order completion.
    *   It can influence pricing.

---

### `scene`
*   **Default Value**: `null`
*   **Purpose**: Holds the reference to the main Three.js `Scene` object once it's initialized in `initThreeJS()`.
*   **Effect on Application**:
    *   This is the root object in the Three.js scene graph where all 3D objects (table model, lights, labels) are added.
    *   It's used by the renderer to draw the 3D visualization.
    *   Various modules interact with the scene to add or remove objects (e.g., `TableModelModule`, `DimensionLabelsModule`).

---

### `renderer`
*   **Default Value**: `null`
*   **Purpose**: Holds the reference to the Three.js `WebGLRenderer` object once initialized.
*   **Effect on Application**:
    *   Responsible for rendering the `scene` using the `camera` onto the HTML canvas element (`#table-3d-canvas`).
    *   Its properties (size, shadow map settings) are configured in `initThreeJS()`.
    *   Used in the `animate()` loop to draw each frame.
    *   Used by `downloadScreenshot()` to capture the current view.

---

### `camera`
*   **Default Value**: `null`
*   **Purpose**: Holds the reference to the Three.js `PerspectiveCamera` object.
*   **Effect on Application**:
    *   Defines the viewpoint from which the `scene` is rendered. Its position, aspect ratio, and field of view are set in `initThreeJS()` and updated on window resize.
    *   Manipulated by `OrbitControls` (referenced in `appState.controls`) to allow user interaction (orbit, zoom, pan).
    *   The `DimensionLabelsModule` uses the camera's position and orientation to ensure labels face the camera.

---

### `controls`
*   **Default Value**: `null`
*   **Purpose**: Holds the reference to the Three.js `OrbitControls` instance, which allows users to interactively change the camera's view of the 3D model.
*   **Effect on Application**:
    *   Initialized in `initThreeJS()` via `ControlsModule.init()`.
    *   Updated in the `animate()` loop to reflect user input.
    *   Its `autoRotate` and `autoRotateSpeed` properties are managed by `toggleAutoRotate()` and the `appState.isAutoRotating` / `appState.autoRotateSpeed` properties.

---

### `isAutoRotating`
*   **Default Value**: `false`
*   **Purpose**: A boolean flag that indicates whether the 3D model should be automatically rotating.
*   **Effect on Application**:
    *   Toggled by the `toggleAutoRotate()` function, which is triggered by the play/pause button in the UI.
    *   When `true`, the `animate()` loop enables `autoRotate` on the `OrbitControls` and uses `appState.autoRotateSpeed`.
    *   The UI of the play/pause button (icon and title) changes based on this state.

---

### `autoRotateSpeed`
*   **Default Value**: `0.01`
*   **Purpose**: Defines the speed of the automatic rotation when `isAutoRotating` is `true`.
*   **Effect on Application**:
    *   This value is used in the `animate()` loop to set the `autoRotateSpeed` of the `OrbitControls`. Note that `OrbitControls` might scale this value, as indicated by the comment `appState.autoRotateSpeed * 100`.
    *   Currently, there is no UI element to directly change this speed; it's a fixed value.

---

## Core Functions Documentation (`js/main.js`)

This document provides a detailed description of key functions within `js/main.js`, outlining their purpose, actions, and role in the Modern Table Designer application.

---

### `initThreeJS()`

*   **Primary Purpose**:
    To initialize and set up the entire 3D environment required for rendering the table model. This function is the cornerstone of the visualizer.

*   **Key Actions**:
    1.  **Browser Compatibility Check**:
        *   Calls `window.CompatibilityModule.check()` to verify if the browser supports WebGL.
        *   If WebGL is not supported, it calls `window.CompatibilityModule.showWebGLWarning()` to display a warning to the user and then aborts further 3D initialization. It still allows the UI to load.
    2.  **Canvas Container**:
        *   Retrieves the HTML element (`<div id="table-3d-canvas">`) designated as the container for the 3D canvas. Exits if not found.
    3.  **Scene Creation**:
        *   Instantiates a new `THREE.Scene` object and assigns it to `appState.scene`.
        *   Sets the background color of the scene (e.g., `0x1e1e24`).
    4.  **Camera Setup**:
        *   Creates a `THREE.PerspectiveCamera` and assigns it to `appState.camera`.
        *   Configures camera properties:
            *   Field of View (FOV): `40` degrees.
            *   Aspect Ratio: Based on the canvas container's width and height.
            *   Near and Far Clipping Planes: `0.1` and `1000` respectively.
        *   Sets the initial camera position (e.g., `(3, 2.8, 3)`) and makes it look at the scene's origin `(0,0,0)`.
    5.  **Renderer Initialization**:
        *   Creates a `THREE.WebGLRenderer` with `antialias: true` and `alpha: true` (for transparency, though the scene has a background color). Assigns it to `appState.renderer`.
        *   Sets the renderer's size to match the canvas container's dimensions.
        *   Enables shadow mapping (`renderer.shadowMap.enabled = true`) and sets the shadow map type (e.g., `THREE.PCFSoftShadowMap`).
        *   Appends the renderer's DOM element (the `<canvas>`) to the container div.
        *   Includes error handling for renderer creation, showing a WebGL warning if it fails.
    6.  **Lighting**:
        *   Calls the `addLights()` function to populate the scene with necessary light sources.
    7.  **Controls Initialization**:
        *   Initializes `OrbitControls` by calling `window.ControlsModule.init(appState.camera, appState.renderer)` and assigns the instance to `appState.controls`. This allows user interaction with the camera.
    8.  **Model Loading Indicator**:
        *   Activates a loading indicator UI element (`.model-loading`) to signify that the 3D model is being prepared.
    9.  **Initial Table Model**:
        *   Calls `updateTableModel()` to create and display the default table model based on initial `appState` values.
    10. **Animation Loop**:
        *   Calls the `animate()` function to start the continuous rendering loop.
    11. **Event Listener for Resize**:
        *   Adds a `resize` event listener to the window, which calls `onWindowResize()` to handle adjustments when the browser window size changes.

*   **Role in Application Lifecycle**:
    *   This function is called once when the DOM is fully loaded, as part of the main initialization sequence.
    *   It's responsible for the complete setup of the 3D visualization environment. If this function (or parts of it, like WebGL detection) fails, the 3D preview functionality will be unavailable or significantly impaired.
    *   It populates several key properties in the `appState` object (`scene`, `camera`, `renderer`, `controls`) that are then used throughout the application for 3D interactions and updates.

---

### `addLights()`

*   **Primary Purpose**:
    To create and add various light sources to the Three.js scene, enhancing the visual appearance and realism of the 3D table model by providing illumination and enabling shadows.

*   **Key Actions**:
    1.  **Scene Check**: Exits if `appState.scene` is not yet initialized.
    2.  **Ambient Light**:
        *   Creates a `THREE.AmbientLight` (e.g., `0xffffff`, intensity `0.7`).
        *   Adds it to `appState.scene` to provide basic, uniform illumination to all objects.
    3.  **Directional Light (Main)**:
        *   Creates a `THREE.DirectionalLight` (e.g., `0xffffff`, intensity `1.0`).
        *   Sets its position (e.g., `(5, 10, 7.5)`), effectively defining the direction from which the main light comes.
        *   Enables shadow casting (`castShadow = true`).
        *   Configures shadow properties:
            *   `shadow.mapSize.width` and `shadow.mapSize.height` (e.g., `2048`) for shadow quality.
            *   `shadow.camera.near` and `shadow.camera.far` to define the shadow camera's frustum.
            *   `shadow.bias` (e.g., `-0.0005`) to help prevent shadow artifacts like "shadow acne."
        *   Adds it to `appState.scene`.
    4.  **Fill Light**:
        *   Creates another `THREE.DirectionalLight` (e.g., `0xffffff`, intensity `0.5`).
        *   Positions it to illuminate areas that might be shadowed by the main directional light (e.g., `(-5, 5, -7.5)`).
        *   Adds it to `appState.scene`.
    5.  **Front Light**:
        *   Creates a `THREE.DirectionalLight` (e.g., `0xffffff`, intensity `0.4`).
        *   Positions it to provide better illumination on the front surfaces of the table (e.g., `(0, 3, 5)`).
        *   Adds it to `appState.scene`.

*   **Role in Application Lifecycle**:
    *   Called once by `initThreeJS()` during the initial setup of the 3D environment.
    *   Crucial for the visual quality of the rendered 3D model. Without adequate lighting, the table would appear dark or flat. The directional light with shadow casting is particularly important for depth perception and realism.

---

### `updateTableModel()`

*   **Primary Purpose**:
    To refresh and rebuild the 3D table model in the scene whenever a user changes a customizable parameter (like dimensions, color, edge style, or leg style).

*   **Key Actions**:
    1.  **Loading Indicator**:
        *   Activates the `.model-loading` UI element to inform the user that the model is being updated.
    2.  **Configuration Object**:
        *   Creates a `config` object containing all relevant properties from `appState` that define the table's appearance and structure:
            *   `width`: `appState.tableWidth`
            *   `length`: `appState.tableLength`
            *   `height`: `appState.tableHeight`
            *   `thickness`: `appState.tableThickness`
            *   `material`: `appState.currentMaterial` (Note: `appState.currentColor` is primarily used for visual updates by `TableModelModule`)
            *   `edgeStyle`: `appState.edgeStyle`
            *   `legStyle`: `appState.legStyle`
    3.  **Logging**: Logs the material and leg style being used for the update.
    4.  **Model Creation/Update (via `TableModelModule`)**:
        *   Checks if `window.TableModelModule` and `appState.scene` are available.
        *   **Dispose Old Model**: Calls `window.TableModelModule.disposeTableModel(appState.scene)` to remove the previous table model from the scene and free up resources.
        *   **Create New Model**: Uses `setTimeout` with a short delay (50ms) before calling `window.TableModelModule.createTable(config, appState.scene)`. This allows the loading indicator to render before the potentially blocking operation of model creation. The created table (a `THREE.Group`) is added to the scene by the module.
        *   **Update Model Header**: Calls `window.TableModelModule.updateModelHeader(appState.currentMaterial, appState.edgeStyle)` to update any UI elements displaying the current material and edge style.
        *   Includes error handling for model creation and updates the loading indicator if an error occurs.
    5.  **Update UI Dimensions Label**:
        *   If `window.UtilsModule` is available, calls `window.UtilsModule.updateDimensionsLabel(appState.tableWidth, appState.tableLength)` to update the text displaying the table's width and length in the UI (e.g., the model subtitle "109x150 cm").
    6.  **Update 3D Dimension Labels**:
        *   If `window.DimensionLabelsModule` is available:
            *   Calls `window.DimensionLabelsModule.updateDimensionLabels()` to recreate or update the position of the dimension labels (width, length, height) directly on the 3D model.
            *   Ensures the `DimensionLabelsModule` has a reference to the current `appState.camera` by calling `setCamera()`.

*   **Role in Application Lifecycle**:
    *   Called initially by `initThreeJS()` to create the default table.
    *   Called repeatedly throughout the application's use whenever a user interacts with a customization control (e.g., changing a color, adjusting a slider for width, selecting a new leg style). This makes it a central function for reflecting user choices in the 3D preview.

---

### `initEventListeners()`

*   **Primary Purpose**:
    To set up all necessary event listeners for user interactions with the UI elements in the customization panel and the 3D preview controls. This function makes the application interactive.

*   **Key Actions**:
    *   Iterates through various UI elements and attaches event listeners to them. Key interactions handled include:
    1.  **Color Selection (`.color-bar`)**:
        *   Listens for clicks on color items.
        *   Updates `appState.currentColor` and `appState.currentColorName`.
        *   Calls `updateTableModel()` to reflect the color change in the 3D model.
        *   Calls `window.UtilsModule.updatePricing()` to update the price.
    2.  **Material Information Selection (`.material-grid`)**:
        *   Listens for clicks on material info items.
        *   Updates `appState.currentMaterialInfo` and `appState.currentMaterialName` (primarily for informational display, does not directly change the model's visual material in the current setup).
    3.  **Dimension Controls (Sliders and Number Inputs)**:
        *   Attaches `input` and `change` (and `blur`/`keypress` for number inputs) listeners to all dimension sliders and number inputs.
        *   Uses a `handleDimensionUpdate` function to process changes:
            *   Validates the input value against min/max limits.
            *   Synchronizes the values between corresponding sliders and number inputs.
            *   Updates the relevant `appState` properties (`tableWidth`, `tableLength`, `tableHeight`, `tableThickness`).
            *   Updates the UI dimensions label (`UtilsModule.updateDimensionsLabel`).
            *   Updates 3D dimension labels (`DimensionLabelsModule.updateDimensionLabels`).
            *   Uses throttled and debounced calls to `updateTableModel()` for responsive updates during slider interaction and a final update.
            *   Calls a debounced `updatePricing()`.
    4.  **Style Options (Edge and Leg Styles)**:
        *   Listens for clicks on `.style-option` buttons.
        *   Updates `appState.edgeStyle` or `appState.legStyle` based on the clicked option.
        *   Calls `updateTableModel()` and `updatePricing()`.
    5.  **Features Checkboxes (`.feature-checkbox`)**:
        *   Listens for `change` events.
        *   Calls `updatePricing()` (model doesn't change, only price).
    6.  **"Complete Order" Button (`#completeOrderBtn`)**:
        *   Gathers all current configuration details from `appState` and selected features.
        *   Displays an order confirmation message with a summary and total price.
    7.  **Play/Pause Auto-Rotate Button (`#playPauseBtn`)**:
        *   Calls `toggleAutoRotate()` when clicked.
    8.  **Download Screenshot Button (`#downloadBtn`)**:
        *   Calls `downloadScreenshot()` when clicked.
    9.  **Toggle Dimensions Visibility Button (`#dimensionsBtn`)**:
        *   Toggles the visibility of 3D dimension labels using `DimensionLabelsModule.toggleDimensionLabels()`.
        *   Updates its own appearance (active state, title).

*   **Role in Application Lifecycle**:
    *   Called once when the DOM is fully loaded, after `initThreeJS()`.
    *   It's responsible for making the UI interactive. Without these event listeners, user selections in the customization panel would not have any effect on the 3D model or the application state.
    *   It acts as the bridge between user input and the application's reactive logic (updating state, visuals, and pricing).

---

## JavaScript Modules Documentation (`js/modules/`)

This document provides a brief overview of the likely responsibilities of each JavaScript module found in the `js/modules/` directory, based on their filenames and common roles in web and 3D application development.

---

### `compatibility.js` (as `CompatibilityModule`)

*   **Likely Responsibilities**:
    *   **Browser Feature Detection**: This module is likely responsible for checking the user's browser for support of essential web technologies required by the application.
    *   **WebGL Support Check**: Given the 3D nature of the application, a primary function (e.g., `CompatibilityModule.check()`) would be to verify if WebGL (Web Graphics Library) is available and enabled.
    *   **Displaying Warnings**: If critical features like WebGL are missing, this module may handle the display of appropriate warning messages to the user (e.g., via `CompatibilityModule.showWebGLWarning()`), suggesting alternative browsers or steps to enable the technology.
    *   **Graceful Degradation**: It might provide flags or functions that allow the rest of the application to gracefully degrade or disable certain features if the browser doesn't meet all requirements.

---

### `controls.js` (as `ControlsModule`)

*   **Likely Responsibilities**:
    *   **3D Camera Interaction**: This module is central to user interaction with the 3D scene. It likely initializes and manages camera controls.
    *   **OrbitControls Integration**: Specifically, it probably wraps or implements Three.js's `OrbitControls` (or a similar control scheme) to allow users to orbit the camera around the table model, zoom in/out, and pan the view. The `ControlsModule.init(camera, renderer)` call suggests this setup.
    *   **Input Handling**: It would handle mouse and touch inputs for manipulating the camera.
    *   **View Adjustments**: May also include logic for programmatic view changes, such as resetting the view to a default position or switching between predefined camera angles (e.g., top, side, perspective), possibly initiated by UI buttons.
    *   **Zoom Functionality**: Could be responsible for handling zoom operations, potentially linking UI elements like zoom sliders to camera adjustments.

---

### `dimensionLabels.js` (as `DimensionLabelsModule`)

*   **Likely Responsibilities**:
    *   **Displaying 3D Dimensions**: This module's main role is to render and manage labels that display the table's dimensions (width, length, height) directly within the 3D scene, attached to or near the table model.
    *   **Label Creation and Updates**: It would contain functions to create these labels (likely as textured planes or HTML elements transformed via CSS3D) and update their content and position when the table's dimensions change (e.g., `DimensionLabelsModule.updateDimensionLabels()`).
    *   **Camera Synchronization**: The labels need to remain readable and correctly oriented towards the camera as the user navigates the scene. This module would handle updating label orientation based on camera movements.
    *   **Visibility Toggle**: It likely includes functionality to show or hide these dimension labels based on user preference (e.g., a UI toggle button).

---

### `materials.js` (as `MaterialsModule`)

*   **Likely Responsibilities**:
    *   **Material Definitions**: This module would define the properties of various materials that can be applied to the table model. This could include colors, textures, shininess, roughness, metalness, etc.
    *   **Texture Loading and Management**: If image textures are used for materials (e.g., wood grains), this module would handle loading these texture files and making them available to Three.js materials.
    *   **Creating Three.js Materials**: It would provide functions to create `THREE.Material` (or its derivatives like `THREE.MeshStandardMaterial`, `THREE.MeshPhysicalMaterial`) instances based on selected options.
    *   **Applying Materials**: While `TableModelModule` might apply the material, `MaterialsModule` would be the source for creating and configuring these material objects.
    *   *(Note: In the current project structure observed from `main.js`, `appState.currentColor` seems to directly drive the table's color. This module might be intended for more advanced texture-based material options or future enhancements.)*

---

### `tableModel.js` (as `TableModelModule`)

*   **Likely Responsibilities**:
    *   **3D Table Geometry Generation**: This is a core module responsible for procedurally generating the 3D geometry of the table based on the current set of parameters from `appState` (width, length, height, thickness, edge style, leg style).
    *   **Mesh Creation**: It creates `THREE.Mesh` objects for the different parts of the table (tabletop, legs).
    *   **Applying Materials/Colors**: It applies the selected material (or color via `appState.currentColor`) to the table meshes.
    *   **Assembly**: It groups the individual parts (tabletop, legs) into a single `THREE.Group` representing the complete table.
    *   **Dynamic Updates**: The `TableModelModule.createTable(config, scene)` function suggests it handles the creation and addition of the table to the scene. It also includes `disposeTableModel` to clean up old models.
    *   **Edge and Leg Styling**: Implements the logic to create different geometric styles for table edges (straight, beveled, rounded) and legs (standard, U-shape, X-shape, etc.).

---

### `utils.js` (as `UtilsModule`)

*   **Likely Responsibilities**:
    *   **Helper Functions**: This module serves as a collection of utility or helper functions used across different parts of the application.
    *   **Debounce and Throttle**: Provides functions for debouncing and throttling event handlers to optimize performance, particularly for frequent events like slider movements.
    *   **DOM Manipulation**: May contain helper functions for common DOM operations if not handled directly by other modules.
    *   **UI Updates**: Functions like `updateDimensionsLabel` (to update the dimension text in the UI) and `updatePricing` (to recalculate and display the price based on selections) would reside here.
    *   **Animation Utilities**: The `UtilsModule.initScrollReveal()` call indicates it's responsible for initializing animations that trigger as elements scroll into view.
    *   **Formatting**: Could include functions for formatting numbers, strings, or other data for display.
    *   **Mathematical Helpers**: Might contain simple mathematical functions if needed by various modules for calculations.

---

## Application Flow: From User Interaction to UI Update

This document outlines the typical sequence of events in the Modern Table Designer application, starting from a user interaction with a customization control to the subsequent updates in the 3D model and other relevant UI elements.

The flow is primarily orchestrated by `js/main.js`, which handles event listening, state management (`appState`), and triggers updates to various modules.

---

### Typical Event Flow (Example: User Changes Table Width)

1.  **Initialization**:
    *   On `DOMContentLoaded`, `initThreeJS()` sets up the 3D environment (scene, camera, renderer, lights, controls).
    *   Crucially, `initEventListeners()` is called, which attaches event listeners to all relevant UI controls in the customization panel (e.g., color pickers, dimension sliders, style selectors) and preview controls (e.g., auto-rotate, download).

2.  **User Interaction**:
    *   The user interacts with a UI element. For instance, they drag a slider or type a new value in the number input for "Genişlik" (Width) in the "Ölçüler" (Dimensions) section of the customization panel.

3.  **Event Listener Activation**:
    *   The corresponding event listener, set up in `initEventListeners()`, fires.
    *   For dimension changes (sliders/number inputs), this is typically an `input`, `change`, or `blur` event.
    *   A dedicated handler function, `handleDimensionUpdate(sourceInput)`, is invoked within the event listener for dimension inputs. For other inputs like color selection or style options, a specific inline function or a direct call to update functions occurs.

4.  **Input Processing and `appState` Update**:
    *   **For Dimension Changes (`handleDimensionUpdate`)**:
        *   The `dimension` (e.g., 'width') and `value` are extracted from the `sourceInput` element.
        *   The input `value` is parsed (e.g., `parseFloat()`).
        *   **Validation**: The value is checked against predefined limits (e.g., width between 80-180 cm).
            *   If invalid, a warning is logged, and a visual cue (e.g., `invalid` class) might be temporarily added to the input field. The flow for this specific change might halt or the input might be reverted.
            *   If valid, a `valid` class might be temporarily added for positive feedback.
        *   **Synchronization**: If the change came from a slider, the corresponding number input is updated with the new value, and vice-versa, ensuring UI consistency.
        *   The validated `value` is immediately used to update the corresponding property in the global `appState` object (e.g., `appState.tableWidth = value;`).
    *   **For Other Changes (e.g., Color, Style)**:
        *   The selected value (e.g., color hex code, style identifier) is retrieved from the clicked element's `data-*` attributes.
        *   The relevant `appState` properties are updated directly (e.g., `appState.currentColor = selectedColor; appState.edgeStyle = option.dataset.edge;`).

5.  **Immediate UI Updates (Triggered by `appState` Change or Event Handler)**:
    *   **Dimension Badge/Label (UI Text)**: For dimension changes, `UtilsModule.updateDimensionsLabel(appState.tableWidth, appState.tableLength)` is called to update the text displaying the table's overall width and length in the UI (e.g., the "109x150 cm" text in the model preview header).
    *   **3D Dimension Labels**: For dimension changes, `DimensionLabelsModule.updateDimensionLabels(...)` is called. This function updates the text content and potentially the position of labels that are rendered directly on or near the 3D model in the scene.

6.  **`updateTableModel()` Invocation**:
    *   This function is the core of updating the 3D visualization.
    *   **For Dimension Changes**: To ensure responsiveness during continuous interactions (like dragging a slider) and to avoid excessive re-rendering, the call to `updateTableModel()` is managed using:
        *   **Throttling**: `throttledModelUpdate()` (e.g., `UtilsModule.throttle(updateTableModel, 100)`) is called. This ensures `updateTableModel()` is executed at most once every X milliseconds (e.g., 100ms) during continuous input, providing fairly immediate visual feedback.
        *   **Debouncing**: `debouncedModelUpdate()` (e.g., `UtilsModule.debounce(updateTableModel, 50)`) is also called. This schedules `updateTableModel()` to run after a short period of inactivity (e.g., 50ms), ensuring a final, precise update once the user stops interacting.
    *   **For Single-Click Events** (like color selection, edge/leg style selection): `updateTableModel()` is usually called directly within the event handler, or after a minimal debounce.

7.  **Inside `updateTableModel()` - The 3D Model Refresh Process**:
    *   **Loading Indicator**: A visual loading indicator (`.model-loading` in `index.html`) is activated to inform the user that the model is processing.
    *   **Configuration Object**: A `config` object is created. This object is a snapshot of the current relevant settings from `appState` that define the table's geometry and appearance (e.g., `width: appState.tableWidth`, `length: appState.tableLength`, `height: appState.tableHeight`, `thickness: appState.tableThickness`, `material: appState.currentMaterial` (though color is key), `edgeStyle: appState.edgeStyle`, `legStyle: appState.legStyle`).
    *   **Interaction with `TableModelModule`**:
        *   `TableModelModule.disposeTableModel(appState.scene)`: Before creating a new model, the previously rendered table model is removed from the `appState.scene`. This is crucial for preventing overlapping geometries and for managing memory by disposing of old Three.js objects.
        *   `TableModelModule.createTable(config, appState.scene)`: This is the central call to rebuild the table. The `TableModelModule` takes the `config` object and:
            *   Procedurally generates the new 3D geometry for all parts of the table (tabletop, legs) according to the specified dimensions and style choices (edge, leg).
            *   Applies the current color (primarily from `appState.currentColor`, which `TableModelModule` uses to create and apply a `THREE.Material`) to the newly created table meshes.
            *   Assembles these parts into a `THREE.Group` and adds this group to the `appState.scene`.
        *   `TableModelModule.updateModelHeader(appState.currentMaterial, appState.edgeStyle)`: This function is called to update any UI elements in the preview header that display information about the current material or edge style.
    *   **Loading Indicator Deactivation**: The loading indicator is typically hidden once the `TableModelModule.createTable` operation is complete (often handled by a `setTimeout` or a promise if `createTable` were asynchronous).
    *   **Updating 3D Dimension Labels (Post-Model Creation)**:
        *   `DimensionLabelsModule.updateDimensionLabels(appState.scene, {...})` is called again to ensure the 3D labels accurately reflect the newly created model's dimensions and are correctly positioned.
        *   `DimensionLabelsModule.setCamera(appState.camera)` ensures the label module has the current camera reference, which is important for orienting labels towards the camera.

8.  **Pricing Update**:
    *   `UtilsModule.updatePricing()` is called. This function is often debounced for dimension changes (to avoid rapid recalculations during slider dragging) or called directly for discrete selections like features, color, or style.
    *   It recalculates the total price based on the current `appState` values (dimensions, selected material/color cost implications if any) and any selected additional features (from checkboxes).
    *   The updated price is then reflected in the "Fiyat Özeti" (Pricing Summary) section of the UI.

9.  **Continuous Rendering Loop (`animate`)**:
    *   The `animate()` function runs continuously using `requestAnimationFrame`.
    *   In each frame, it calls `appState.renderer.render(appState.scene, appState.camera)`.
    *   This ensures that any changes made to the `appState.scene` (such as the newly updated table model from `TableModelModule` or updated 3D dimension labels from `DimensionLabelsModule`) are drawn to the screen, making the updates visible to the user.
    *   It also updates `appState.controls` (OrbitControls) and handles the auto-rotation logic if enabled.

---

### Summary of Data Flow and Module Interactions:

1.  **User Input (UI Element)**
2.  **Event Listener (`js/main.js - initEventListeners`)**
    *   Reads input value.
    *   Updates relevant properties in **`appState`**.
3.  **`appState` change triggers further actions**:
    *   Immediate UI text updates (e.g., dimension badge via `UtilsModule`).
    *   Immediate 3D label text/position updates (via `DimensionLabelsModule`).
    *   Call to **`updateTableModel()`** (often throttled/debounced).
4.  **`updateTableModel()` orchestrates 3D model regeneration**:
    *   Shows loading indicator.
    *   Calls `TableModelModule.disposeTableModel()`.
    *   Calls **`TableModelModule.createTable()`** (passes current `appState` via `config`).
        *   `TableModelModule` builds new `THREE.Mesh` objects, applies materials (color), and adds them to `appState.scene`.
    *   Calls `TableModelModule.updateModelHeader()`.
    *   Updates 3D dimension labels again via `DimensionLabelsModule` for the new model.
    *   Hides loading indicator.
5.  **Pricing recalculation**:
    *   `UtilsModule.updatePricing()` is called (based on `appState` and feature checkboxes).
6.  **Continuous Rendering**:
    *   The `animate()` loop renders the modified `appState.scene` using `appState.renderer` and `appState.camera`.

This flow ensures that user customizations are dynamically reflected in the 3D model and all relevant informational parts of the UI, providing an interactive and responsive experience.
---
