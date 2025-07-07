# WebSeed Documentation

## API Reference

### Core Functions

#### `applyFilters()`
Applies all current filter settings to the loaded image.

**Usage:**
- Called automatically when any control is adjusted
- Processes the original image data with current settings
- Updates the canvas with the result

**Filter Order:**
1. Grayscale conversion (if enabled)
2. Brightness adjustment
3. Contrast adjustment
4. Saturation (if not in grayscale mode)
5. Temperature & Tint (if not in grayscale mode)
6. Highlights & Shadows
7. Whites & Blacks
8. Vignette effect

#### `applyPresetFilters(settings)`
Applies a preset configuration of filter values.

**Parameters:**
- `settings` (Object): Filter values to apply

**Example:**
```javascript
applyPresetFilters({
    brightness: 10,
    contrast: 120,
    saturation: 80
});
```

### Image Processing

WebSeed uses HTML5 Canvas and ImageData API for real-time image processing:

```javascript
// Get pixel data
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Process each pixel (RGBA format)
for (let i = 0; i < imageData.data.length; i += 4) {
    let r = imageData.data[i];     // Red
    let g = imageData.data[i + 1]; // Green
    let b = imageData.data[i + 2]; // Blue
    // Alpha at imageData.data[i + 3]
    
    // Apply transformations...
}

// Update canvas
ctx.putImageData(imageData, 0, 0);
```

### Filter Algorithms

#### Brightness
Simple addition to RGB values:
```javascript
r += brightness;
g += brightness;
b += brightness;
```

#### Contrast
Scales values around midpoint (128):
```javascript
r = ((r - 128) * contrast) + 128;
```

#### Saturation
Blends with grayscale using luminance weights:
```javascript
const gray = 0.299 * r + 0.587 * g + 0.114 * b;
r = gray + (r - gray) * saturation;
```

#### Grayscale
Uses luminance-based conversion:
```javascript
const gray = 0.299 * r + 0.587 * g + 0.114 * b;
r = g = b = gray;
```

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design included

## Performance Notes

- Processing is done pixel-by-pixel for maximum quality
- Large images may take longer to process
- Real-time preview updates as you adjust controls
- Original image quality is preserved

## File Format Support

**Input formats:**
- JPEG/JPG
- PNG
- GIF
- BMP
- WebP (browser dependent)

**Output format:**
- PNG (lossless, high quality)
