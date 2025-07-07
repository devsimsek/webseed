const imageInput = document.getElementById('image-input');
const canvas = document.getElementById('photo-canvas');
const ctx = canvas.getContext('2d');
const controls = document.querySelectorAll('input[type="range"]');
const presets = document.getElementById('presets');
const downloadBtn = document.getElementById('download-btn');
const canvasContainer = document.querySelector('.bg-black\\/20');

let img = new Image();
let originalImageData;
let isGrayscaleMode = false;

// Initialize value displays
function initializeValueDisplays() {
    controls.forEach(control => {
        const valueDisplay = document.getElementById(control.id + '-value');
        if (valueDisplay) {
            valueDisplay.textContent = control.value;

            // Update display when slider changes
            control.addEventListener('input', () => {
                valueDisplay.textContent = control.value;
            });
        }
    });
}

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

img.onload = function () {
    // Show canvas and hide placeholder
    canvasContainer.classList.add('canvas-loaded');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    downloadBtn.disabled = false;
    applyFilters();
};

function applyFilters() {
    if (!originalImageData) return;

    console.log('Applying filters, grayscale mode:', isGrayscaleMode);

    // Get all the filter values
    const brightness = parseInt(document.getElementById('brightness').value, 10);
    const contrast = parseInt(document.getElementById('contrast').value, 10) / 100;
    const saturation = parseInt(document.getElementById('saturation').value, 10) / 100;
    const temperature = parseInt(document.getElementById('temperature').value, 10);
    const tint = parseInt(document.getElementById('tint').value, 10);
    const highlights = parseInt(document.getElementById('highlights').value, 10);
    const shadows = parseInt(document.getElementById('shadows').value, 10);
    const whites = parseInt(document.getElementById('whites').value, 10);
    const blacks = parseInt(document.getElementById('blacks').value, 10);
    const vignette = parseInt(document.getElementById('vignette').value, 10);

    // Create a copy of the original image data
    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );

    // Process each pixel
    for (let i = 0; i < imageData.data.length; i += 4) {
        let r = imageData.data[i];
        let g = imageData.data[i + 1];
        let b = imageData.data[i + 2];

        // GRAYSCALE - Apply this FIRST and ONLY if in grayscale mode
        if (isGrayscaleMode) {
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            r = gray;
            g = gray;
            b = gray;
        }

        // BRIGHTNESS
        r += brightness;
        g += brightness;
        b += brightness;

        // CONTRAST
        r = ((r - 128) * contrast) + 128;
        g = ((g - 128) * contrast) + 128;
        b = ((b - 128) * contrast) + 128;

        // SATURATION - Only if NOT in grayscale mode
        if (!isGrayscaleMode && saturation !== 1) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray + (r - gray) * saturation;
            g = gray + (g - gray) * saturation;
            b = gray + (b - gray) * saturation;
        }

        // TEMPERATURE & TINT - Only if NOT in grayscale mode
        if (!isGrayscaleMode) {
            r += temperature * 0.3;
            b -= temperature * 0.3;
            g += tint * 0.3;
        }

        // HIGHLIGHTS & SHADOWS
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 128) {
            const highlightFactor = highlights * 0.3;
            r += highlightFactor;
            g += highlightFactor;
            b += highlightFactor;
        } else {
            const shadowFactor = shadows * 0.3;
            r -= shadowFactor;
            g -= shadowFactor;
            b -= shadowFactor;
        }

        // WHITES & BLACKS
        const whiteFactor = whites * 0.5;
        const blackFactor = blacks * 0.5;
        r += whiteFactor - blackFactor;
        g += whiteFactor - blackFactor;
        b += whiteFactor - blackFactor;

        // VIGNETTE
        if (vignette > 0) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
            const dist = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            const vignetteStrength = (vignette / 100) * (dist / maxDist);
            const multiplier = Math.max(0.2, 1 - vignetteStrength);

            r *= multiplier;
            g *= multiplier;
            b *= multiplier;
        }

        // Clamp values to 0-255 range
        imageData.data[i] = Math.max(0, Math.min(255, Math.round(r)));
        imageData.data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
        imageData.data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyPresetFilters(settings) {
    const {
        brightness = 0,
        contrast = 100,
        saturation = 100,
        temperature = 0,
        tint = 0,
        highlights = 0,
        shadows = 0,
        whites = 0,
        blacks = 0,
        vignette = 0
    } = settings;

    document.getElementById('brightness').value = brightness;
    document.getElementById('contrast').value = contrast;
    document.getElementById('saturation').value = saturation;
    document.getElementById('temperature').value = temperature;
    document.getElementById('tint').value = tint;
    document.getElementById('highlights').value = highlights;
    document.getElementById('shadows').value = shadows;
    document.getElementById('whites').value = whites;
    document.getElementById('blacks').value = blacks;
    document.getElementById('vignette').value = vignette;

    // Update value displays
    updateAllValueDisplays();
}

function updateAllValueDisplays() {
    controls.forEach(control => {
        const valueDisplay = document.getElementById(control.id + '-value');
        if (valueDisplay) {
            valueDisplay.textContent = control.value;
        }
    });
}

function resetToDefaults() {
    isGrayscaleMode = false;
    controls.forEach((control) => {
        control.value = control.defaultValue;
    });
    updateAllValueDisplays();
}

// Add event listeners to all controls
controls.forEach((control) => control.addEventListener('input', applyFilters));

// Handle preset changes
presets.addEventListener('change', () => {
    const selectedPreset = presets.value;
    console.log('Preset selected:', selectedPreset);

    switch (selectedPreset) {
        case 'vintage':
            isGrayscaleMode = false;
            applyPresetFilters({
                temperature: -30,
                tint: 20,
                contrast: 120,
                saturation: 80,
                vignette: 25
            });
            break;

        case 'blackwhite':
            console.log('Setting grayscale mode to TRUE');
            isGrayscaleMode = true;
            applyPresetFilters({
                brightness: 5,
                contrast: 115,
                highlights: 15,
                shadows: -15
            });
            break;

        case 'hdr':
            isGrayscaleMode = false;
            applyPresetFilters({
                contrast: 140,
                brightness: 10,
                highlights: -25,
                shadows: 25,
                saturation: 110
            });
            break;

        case 'drama':
            isGrayscaleMode = false;
            applyPresetFilters({
                contrast: 130,
                saturation: 70,
                shadows: -25,
                blacks: -15,
                vignette: 30
            });
            break;

        case 'grunge':
            isGrayscaleMode = false;
            applyPresetFilters({
                contrast: 85,
                saturation: 140,
                temperature: -40,
                brightness: -15,
                vignette: 35
            });
            break;

        default: // 'none'
            console.log('Resetting to defaults');
            resetToDefaults();
            applyFilters();
            return;
    }

    console.log('Applying filters after preset change');
    applyFilters();
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'webseed-edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeValueDisplays();
});
