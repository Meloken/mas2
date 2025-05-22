/**
 * @file main.js
 * @description Modern Masa Tasarımcısı uygulamasının ana giriş noktası
 * Tüm modülleri başlatır ve uygulama durumunu yönetir
 */

// Uygulama durumu (Global state object for the application)
var appState = {
    tableWidth: 109, // Varsayılan boyutlar (cm) (Default dimensions in cm)
    tableLength: 150,
    tableHeight: 75,
    tableThickness: 3, // Varsayılan kalınlık (cm) (Default thickness in cm)
    currentMaterial: 'ceviz', // Mevcut malzeme (Current material)
    edgeStyle: 'straight', // Kenar stili (Edge style)
    legStyle: 'standard', // Ayak stili ('standard' veya 'u-shape' olabilir) (Leg style, can be 'standard' or 'u-shape')
    scene: null, // Three.js sahnesi (Three.js scene)
    renderer: null, // Three.js renderer
    camera: null, // Three.js kamera (Three.js camera)
    controls: null // Three.js OrbitControls
};

/**
 * Three.js sahnesini ve ilgili tüm bileşenleri başlatır
 * Initializes the Three.js scene and all related components
 */
function initThreeJS() {
    // Önce tarayıcı uyumluluğunu kontrol et (First, check browser compatibility)
    var compatibility = window.CompatibilityModule.check();
    var loadingScreen = document.querySelector('.loading-screen'); // Yükleme ekranı referansı (Loading screen reference)

    if (!compatibility.webGLSupported) {
        window.CompatibilityModule.showWebGLWarning(); // WebGL uyarı mesajını göster (Show WebGL warning message)
        // 3D özellikleri olmasa bile UI'nin yüklenmesine izin ver (Allow UI to load even without 3D features)
        if (loadingScreen) {
            setTimeout(function() {
                loadingScreen.classList.add('hidden');
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000); // Yükleme ekranını biraz gecikmeyle gizle (Hide loading screen with a slight delay)
        }
        return; // WebGL yoksa 3D başlatmayı sonlandır (End 3D initialization if WebGL is not available)
    }
    
    // Konteyneri al (Get the container element)
    var container = document.getElementById('table-3d-canvas');
    if (!container) {
        console.error("3D canvas konteyneri ('table-3d-canvas') bulunamadı!");
        if (loadingScreen) loadingScreen.style.display = 'none'; // Hata durumunda yükleme ekranını gizle
        return;
    }
    
    // Sahne oluştur (Create the scene)
    appState.scene = new THREE.Scene();
    appState.scene.background = new THREE.Color(0x1e1e24); // Koyu arka plan rengi (Dark background color)
    
    // Kamera oluştur (Create the camera)
    appState.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    appState.camera.position.set(3, 2.8, 3); // Tam masa görünümü için kamera pozisyonu (Camera position for full table view)
    appState.camera.lookAt(0, 0, 0); // Kameranın masanın merkezine bakmasını sağla (Make the camera look at the center of the table)
    
    // Hata yönetimi ile renderer oluştur (Create the renderer with error handling)
    try {
        appState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Kenar yumuşatma ve alfa (şeffaflık) etkin (Antialiasing and alpha (transparency) enabled)
        appState.renderer.setSize(container.clientWidth, container.clientHeight);
        appState.renderer.shadowMap.enabled = true; // Gölgeleri etkinleştir (Enable shadows)
        appState.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Daha yumuşak gölgeler (Softer shadows)
        container.appendChild(appState.renderer.domElement);
    } catch (e) {
        console.error("WebGL renderer oluşturulurken hata:", e);
        window.CompatibilityModule.showWebGLWarning(); // Hata durumunda WebGL uyarısını göster
        if (loadingScreen) loadingScreen.style.display = 'none';
        return; // Renderer başarısız olursa başlatmayı sonlandır
    }
    
    // Işıkları ekle (Add lights to the scene)
    addLights();
    
    // Kontrolleri başlat (Initialize controls)
    appState.controls = window.ControlsModule.init(appState.camera, appState.renderer);
    
    // Yükleme animasyonunu göster (Show loading animation for the model)
    var modelLoadingIndicator = document.querySelector('.model-loading');
    if (modelLoadingIndicator) {
        modelLoadingIndicator.classList.add('active');
    }
    
    // Varsayılan masa modelini oluştur (Create the default table model)
    updateTableModel(); // Bu fonksiyon içinde model yükleme göstergesi yönetilecek
    
    // Animasyon döngüsünü başlat (Start the animation loop)
    animate();
    
    // Pencere yeniden boyutlandırmayı işle (Handle window resize events)
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Sahneye ışıklar oluşturur ve ekler
 * Creates and adds lights to the scene
 */
function addLights() {
    if (!appState.scene) return;

    // Ortam ışığı (Ambient light for overall illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    appState.scene.add(ambientLight);
    
    // Ana yönlü ışık (Main directional light for shadows and highlights)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); 
    directionalLight.position.set(5, 10, 7.5); // Işık pozisyonu (Light position)
    directionalLight.castShadow = true; // Bu ışığın gölge oluşturmasını sağla (Enable shadow casting for this light)
    directionalLight.shadow.mapSize.width = 2048; // Gölge haritası çözünürlüğü (Shadow map resolution for better quality)
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5; // Gölge kamerası için yakın kırpma düzlemi (Near clipping plane for shadow camera)   
    directionalLight.shadow.camera.far = 50; // Gölge kamerası için uzak kırpma düzlemi (Far clipping plane for shadow camera)    
    directionalLight.shadow.bias = -0.0005; // Gölge artefaktlarını (shadow acne) azaltmak için bias ayarı (Bias setting to reduce shadow artifacts)
    appState.scene.add(directionalLight);

    // Dolgu ışığı (Fill light to soften shadows from the opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5); 
    fillLight.position.set(-5, 5, -7.5);
    appState.scene.add(fillLight);
    
    // Ön ışık (Front light to better illuminate the front of the table)
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 3, 5);
    appState.scene.add(frontLight);
}

/**
 * Animasyon döngüsü
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate); // Bir sonraki kare için animasyon iste (Request animation frame for the next frame)
    if (appState.controls && window.ControlsModule) {
        window.ControlsModule.update(); // Kamera kontrollerini güncelle (Update camera controls)
    }
    if (appState.renderer && appState.scene && appState.camera) {
        try {
            appState.renderer.render(appState.scene, appState.camera); // Sahneyi render et (Render the scene)
        } catch (e) {
            console.error("Render döngüsünde hata:", e);
            // Animasyon döngüsünü durdurabilir veya kullanıcıya bir hata mesajı gösterebilirsiniz.
            // You can stop the animation loop here or show an error message to the user.
        }
    }
}

/**
 * Pencere yeniden boyutlandırma olaylarını işler
 * Handles window resize events
 */
function onWindowResize() {
    const container = document.getElementById('table-3d-canvas');
    if (appState.camera && appState.renderer && container) {
        // Kamera en boy oranını güncelle (Update camera aspect ratio)
        appState.camera.aspect = container.clientWidth / container.clientHeight;
        appState.camera.updateProjectionMatrix(); // Kamera projeksiyon matrisini güncelle (Update camera projection matrix)
        
        // Renderer boyutunu güncelle (Update renderer size)
        appState.renderer.setSize(container.clientWidth, container.clientHeight);

        // ControlsModule'deki handleResize çağrılabilir (eğer varsa ve ek mantık içeriyorsa)
        // if (window.ControlsModule && typeof window.ControlsModule.handleResize === 'function') {
        //     window.ControlsModule.handleResize(container);
        // }
    }
}


/**
 * 3D masa modelini mevcut ayarlarla günceller
 * Updates the 3D table model with current settings
 */
function updateTableModel() {
    var modelLoadingIndicator = document.querySelector('.model-loading');
    if (modelLoadingIndicator) {
        modelLoadingIndicator.classList.add('active'); // Model yüklenirken göstergeyi aktif et
        modelLoadingIndicator.querySelector('span').textContent = "Model yükleniyor...";
    }

    // Yapılandırma nesnesi oluştur (Create configuration object)
    var config = {
        width: appState.tableWidth,
        length: appState.tableLength,
        height: appState.tableHeight,
        thickness: appState.tableThickness,
        material: appState.currentMaterial,
        edgeStyle: appState.edgeStyle,
        legStyle: appState.legStyle
    };
    
    console.log("Masa modeli güncelleniyor, malzeme:", appState.currentMaterial);
    
    // Mevcut yapılandırma ile masa oluştur (Create table with current configuration)
    if (window.TableModelModule && appState.scene) {
        try {
            // Modeli oluşturmadan önce kısa bir gecikme ekleyerek yükleme göstergesinin görünmesini sağla
            setTimeout(function() {
                const tableGroup = window.TableModelModule.createTable(config, appState.scene);
                // Model başlığını güncelle (Update model header)
                window.TableModelModule.updateModelHeader(appState.currentMaterial, appState.edgeStyle);
                
                // Model yüklendikten sonra yükleme göstergesini gizle
                // createTable fonksiyonu içinde de gizleme mantığı var, tutarlılık sağlanmalı.
                // if (modelLoadingIndicator) {
                //     modelLoadingIndicator.classList.remove('active');
                // }

                // TANILAYICI GÜNLÜK: Model oluşturulduktan sonra doku kontrolü
                setTimeout(function() {
                    if (appState.scene) {
                        const tableObject = appState.scene.getObjectByName("InteractiveTable");
                        if (tableObject) {
                            let hasTexture = false;
                            tableObject.traverse(function(child) {
                                if (child.isMesh && child.material && child.material.map) {
                                    console.log("DEBUG Texture Check: Mesh bulundu, malzeme adı:", child.material.name, "Doku (map):", child.material.map);
                                    hasTexture = true;
                                } else if (child.isMesh && child.material) {
                                    console.log("DEBUG Texture Check: Mesh bulundu, malzeme adı:", child.material.name, "DOKU YOK (map is null or undefined)");
                                }
                            });
                            if (hasTexture) {
                                console.log("DEBUG Texture Check: En az bir mesh üzerinde doku bulundu.");
                            } else {
                                console.warn("DEBUG Texture Check: Modelde hiçbir mesh üzerinde doku (material.map) bulunamadı. Lütfen 'materials.js' ve doku dosyalarınızı kontrol edin.");
                            }
                        } else {
                            console.warn("DEBUG Texture Check: 'InteractiveTable' adlı model grup sahnesinde bulunamadı.");
                        }
                    }
                }, 500); // Modelin ve dokuların yüklenmesi için biraz daha bekle

            }, 50); // 50ms gecikme

        } catch (e) {
            console.error("Masa modeli oluşturulurken hata:", e);
            if (modelLoadingIndicator) {
                modelLoadingIndicator.classList.remove('active'); // Hata durumunda da göstergeyi kaldır
                modelLoadingIndicator.querySelector('span').textContent = "Model yüklenemedi!";
            }
        }
    }
    
    // Boyut etiketini güncelle (Update dimensions label)
    if (window.UtilsModule) {
        window.UtilsModule.updateDimensionsLabel(appState.tableWidth, appState.tableLength);
    }
}

/**
 * Tüm UI olay dinleyicilerini başlatır
 * Initializes all UI event listeners
 */
function initEventListeners() {
    // Malzeme seçimi (Material selection)
    document.querySelectorAll('.material-item').forEach(function(item) {
        item.addEventListener('click', function() {
            // Önceki seçimi kaldır (Remove previous selection)
            document.querySelectorAll('.material-item').forEach(function(i) {
                i.classList.remove('selected');
            });
            // Yeni öğeyi seç (Select the new item)
            item.classList.add('selected');
            
            // Malzeme türünü al (Get material type from class)
            var classes = item.classList;
            for (const className of classes) {
                if (className.startsWith('material-')) {
                    appState.currentMaterial = className.replace('material-', '');
                    break;
                }
            }
            // Masa modelini ve fiyatlandırmayı güncelle (Update table model and pricing)
            updateTableModel();
            if (window.UtilsModule) window.UtilsModule.updatePricing();
        });
    });
    
    // Boyut kaydırıcıları (Dimension sliders)
    document.querySelectorAll('input[type="range"]').forEach(function(slider) {
        slider.addEventListener('input', function() {
            var dimension = slider.dataset.dimension;
            var value = parseFloat(slider.value);
            var valueDisplay = slider.closest('.dimension-row').querySelector('.dimension-value');
            
            if (valueDisplay) { // Değer gösterge elemanının varlığını kontrol et
                 if (dimension === 'thickness' && value < 1) { // Kalınlık için özel gösterim (mm)
                    valueDisplay.textContent = (value * 10).toFixed(0) + ' mm'; 
                } else {
                    valueDisplay.textContent = value.toFixed(0) + ' cm'; // Diğer boyutlar için cm
                }
            }
            
            // Uygulama durumundaki boyutu güncelle (Update dimension in app state)
            switch(dimension) {
                case 'width': appState.tableWidth = value; break;
                case 'length': appState.tableLength = value; break;
                case 'height': appState.tableHeight = value; break;
                case 'thickness': appState.tableThickness = value; break;
            }
            updateTableModel();
            if (window.UtilsModule) window.UtilsModule.updatePricing();
        });
    });
    
    // Stil seçenekleri (Edge and Leg style options)
    document.querySelectorAll('.style-option').forEach(function(option) {
        option.addEventListener('click', function() {
            var group = option.parentElement;
            if (group) { // Grup içindeki diğer seçeneklerden seçimi kaldır
                group.querySelectorAll('.style-option').forEach(function(opt) {
                    opt.classList.remove('selected');
                });
            }
            option.classList.add('selected'); // Tıklananı seç
            
            // Uygulama durumundaki stili güncelle
            if (option.hasAttribute('data-edge')) {
                appState.edgeStyle = option.dataset.edge;
            } else if (option.hasAttribute('data-leg')) {
                appState.legStyle = option.dataset.leg;
            }
            updateTableModel();
            if (window.UtilsModule) window.UtilsModule.updatePricing();
        });
    });
    
    // Özellikler onay kutuları (Features checkboxes)
    document.querySelectorAll('.feature-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            if (window.UtilsModule) window.UtilsModule.updatePricing(); // Sadece fiyatı güncelle
        });
    });

    // "Siparişi Tamamla" butonu (Complete Order button)
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    const orderMessageDiv = document.getElementById('orderMessage');

    if (completeOrderBtn && orderMessageDiv) {
        completeOrderBtn.addEventListener('click', function() {
            // Seçilen yapılandırmayı topla (Gather selected configuration)
            const selectedConfiguration = {
                width: appState.tableWidth,
                length: appState.tableLength,
                height: appState.tableHeight,
                thickness: appState.tableThickness,
                material: appState.currentMaterial,
                edgeStyle: appState.edgeStyle,
                legStyle: appState.legStyle,
                features: []
            };

            document.querySelectorAll('.feature-checkbox:checked').forEach(function(checkbox) {
                const label = checkbox.nextElementSibling; // Etiketi al (Get the label)
                if (label && label.childNodes && label.childNodes.length > 0) {
                    // Etiketin ilk metin düğümünü al (fiyat bilgisini hariç tutmak için)
                    // Get the first text node of the label (to exclude price info)
                    selectedConfiguration.features.push(label.childNodes[0].textContent.trim());
                }
            });

            const totalPriceElement = document.querySelector('.pricing-summary .price-row.total .price-value');
            const totalPrice = totalPriceElement ? totalPriceElement.textContent : 'Hesaplanamadı';

            // Mesajı göster (Display the message)
            let featureText = selectedConfiguration.features.length > 0 ? ` Ek Özellikler: ${selectedConfiguration.features.join(', ')}.` : '';
            orderMessageDiv.textContent = `Siparişiniz alındı! ${totalPrice} tutarındaki ${selectedConfiguration.material} masanız (${selectedConfiguration.width}x${selectedConfiguration.length}cm, ${selectedConfiguration.edgeStyle} kenar, ${selectedConfiguration.legStyle} ayak)${featureText} Yakında hazırlanacaktır.`;
            
            console.log("Sipariş Tamamlandı:", selectedConfiguration);
            console.log("Toplam Fiyat:", totalPrice);

            // Birkaç saniye sonra mesajı temizle (isteğe bağlı) (Clear message after a few seconds (optional))
            setTimeout(function() {
                orderMessageDiv.textContent = '';
            }, 10000); // 10 saniye sonra mesajı sil (Clear message after 10 seconds)
        });
    }
}

/**
 * DOM yüklendiğinde ana başlatma fonksiyonu çağrılır
 * Main initialization function called when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    var loadingScreen = document.querySelector('.loading-screen');
    
    // Modüllerin yüklenip yüklenmediğini kontrol et (Check if modules are loaded)
    if (!window.CompatibilityModule || !window.MaterialsModule || !window.TableModelModule || !window.ControlsModule || !window.UtilsModule) {
        console.error("Bir veya daha fazla kritik modül yüklenemedi. Uygulama başlatılamıyor.");
        if (loadingScreen) loadingScreen.style.display = 'none';
        const body = document.querySelector('body');
        if (body) body.innerHTML = "<div style='text-align:center; padding: 20px; font-family: sans-serif; color: white; background-color: #121212; height: 100vh; display: flex; justify-content: center; align-items: center;'>Uygulama başlatılırken kritik bir sorun oluştu. Lütfen geliştirici konsolunu kontrol edin.</div>";
        return;
    }
    
    // UI elemanları için yükleme süresini simüle et (Simulate loading time for UI elements)
    // Bu, initThreeJS içindeki WebGL kontrolünden sonra daha mantıklı olabilir.
    if (loadingScreen) { // WebGL kontrolünden bağımsız olarak yükleme ekranını yönet
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500); // Gizlendikten sonra DOM'dan kaldır
        }, 1500); // Simülasyon süresi (Simulation duration)
    }

    // Three.js sahnesini başlat (Initialize Three.js scene)
    // initThreeJS kendi içinde WebGL kontrolünü ve ilgili yükleme ekranı yönetimini yapacak.
    initThreeJS(); 
    
    // Tüm olay dinleyicilerini başlat (Initialize all event listeners)
    initEventListeners();
    
    // Kaydırma ortaya çıkarma animasyonlarını ve fiyatlandırmayı başlat (Initialize scroll reveal animations and pricing)
    window.UtilsModule.initScrollReveal();
    window.UtilsModule.updatePricing();
});
