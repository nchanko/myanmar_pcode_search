# Favicon Creation Guide for pcode-myanmar.png

## Manual Favicon Creation Steps

### Required Sizes:
- **16x16px** - Small browser tab favicon
- **32x32px** - Standard browser tab favicon  
- **48x48px** - Windows shortcuts
- **180x180px** - Apple touch icon

### Using Image Editing Software:

#### 1. **Photoshop/GIMP Steps:**
```
1. Open pcode-myanmar.png
2. For each size (16x16, 32x32, 48x48, 180x180):
   - Image > Image Size
   - Set width & height (maintain aspect ratio)
   - Use "Bicubic Sharper" for reduction
   - Save as PNG

3. For favicon.ico:
   - Combine 16x16, 32x32, 48x48 into one .ico file
   - Use online ICO converter or plugins
```

#### 2. **Online Resizing Tools:**
- [TinyPNG](https://tinypng.com/) - For compression
- [ResizeImage.net](https://resizeimage.net/) - For resizing
- [ICO Convert](https://icoconvert.com/) - PNG to ICO conversion

### Design Considerations:
- **Small sizes (16x16, 32x32)**: The detailed "PCODE" text might not be readable
- **Recommendation**: For small favicons, consider using just the magnifying glass + Myanmar map
- **Large sizes (48x48+)**: Full logo with text works well

### Testing:
1. Place files in `/assets/` folder
2. Refresh browser and check tab icon
3. Test on mobile devices for apple-touch-icon 