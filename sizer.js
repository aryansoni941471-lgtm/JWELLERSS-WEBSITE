// Configuration for Sizes
const SIZER_CONFIG = {
    ring: {
        minMm: 13.0, // approx size 1
        maxMm: 24.0, // approx size 35
        label: "Estimated Ring Size (Indian)",
        calculateSize: (mm) => {
            // Formula approx: Size = (mm - 12.5) / 0.32
            let size = Math.round((mm - 12.5) / 0.32);
            if (size < 1) size = 1;
            if (size > 35) size = ">35";
            return size;
        },
        formatDiameter: (mm) => `${mm.toFixed(1)} mm`
    },
    bangle: {
        minMm: 45.0, // Too small
        maxMm: 75.0, // Very large
        label: "Estimated Bangle Size (Indian)",
        calculateSize: (mm) => {
            // Convert mm to inches
            let inches = mm / 25.4;
            // Standard sizes: 2-0, 2-2, 2-4, 2-6, 2-8, 2-10, 2-12, 3-0
            // 2-0 = 2.0 inches, 2-2 = 2.125 inches (difference of 0.125 per step)
            let steps = Math.round((inches - 2.0) / 0.125);
            if (steps < 0) return "< 2-0";
            
            if (steps === 0) return "2-0";
            if (steps === 1) return "2-2";
            if (steps === 2) return "2-4";
            if (steps === 3) return "2-6";
            if (steps === 4) return "2-8";
            if (steps === 5) return "2-10";
            if (steps === 6) return "2-12";
            if (steps === 7) return "2-14";
            if (steps >= 8) return "3-0+";
            
            return "Unknown";
        },
        formatDiameter: (mm) => {
            let inches = mm / 25.4;
            return `${mm.toFixed(1)} mm / ${inches.toFixed(2)}"`;
        }
    }
};

let currentMode = 'ring';
let pixelsPerMm = 3.78; // Default assuming 96 DPI (96 / 25.4)
let scaleFactor = 1.0; // Adjusted by calibration

// Elements
const dynamicCircle = document.getElementById('dynamic-circle');
const sizeSlider = document.getElementById('size-slider');
const resultLabel = document.getElementById('result-label');
const resultSize = document.getElementById('result-size');
const resultDiameter = document.getElementById('result-diameter');

const btnRing = document.getElementById('btn-ring');
const btnBangle = document.getElementById('btn-bangle');

// Calibration Elements
const calibrationModal = document.getElementById('calibration-modal');
const calibSlider = document.getElementById('calib-slider');
const cardBox = document.getElementById('card-box');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setMode('ring');
    
    // Check if calibrated previously
    const savedScale = localStorage.getItem('ljs_sizer_scale');
    if (savedScale) {
        scaleFactor = parseFloat(savedScale);
    }
});

function setMode(mode) {
    currentMode = mode;
    
    // Update active button
    if (mode === 'ring') {
        btnRing.classList.add('active');
        btnBangle.classList.remove('active');
    } else {
        btnBangle.classList.add('active');
        btnRing.classList.remove('active');
    }

    // Update labels
    resultLabel.innerText = SIZER_CONFIG[mode].label;
    
    // Reset slider to middle
    sizeSlider.value = 50;
    updateSize();
}

function updateSize() {
    const config = SIZER_CONFIG[currentMode];
    
    // Slider value (0 to 100) maps to minMm to maxMm
    const percentage = sizeSlider.value / 100;
    const currentMm = config.minMm + (percentage * (config.maxMm - config.minMm));
    
    // Calculate physical pixels based on calibration
    const pixelDiameter = currentMm * pixelsPerMm * scaleFactor;
    
    // Update circle UI
    dynamicCircle.style.width = `${pixelDiameter}px`;
    dynamicCircle.style.height = `${pixelDiameter}px`;
    
    // Update Result UI
    resultSize.innerText = config.calculateSize(currentMm);
    resultDiameter.innerText = `Inner Diameter: ${config.formatDiameter(currentMm)}`;
}

// Calibration Logic
function openCalibration() {
    calibrationModal.style.display = 'flex';
    // Reset box to base size for credit card (85.6mm)
    const basePixels = 85.6 * pixelsPerMm * scaleFactor;
    cardBox.style.width = `${basePixels}px`;
    
    // Set slider position based on current scaleFactor (range 0.5 to 1.5, mapped to 50 to 150)
    calibSlider.value = scaleFactor * 100;
}

function adjustCalibration() {
    // Slider value 50 to 150 means scaleFactor 0.5 to 1.5
    const tempScale = calibSlider.value / 100;
    const currentPixels = 85.6 * pixelsPerMm * tempScale;
    cardBox.style.width = `${currentPixels}px`;
}

function saveCalibration() {
    scaleFactor = calibSlider.value / 100;
    localStorage.setItem('ljs_sizer_scale', scaleFactor);
    calibrationModal.style.display = 'none';
    
    // Re-render current size with new calibration
    updateSize();
    alert("Calibration saved successfully! Results will now be more accurate.");
}
