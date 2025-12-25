#!/bin/bash

SOURCE="icons/icon-cropped.png"

if [ ! -f "$SOURCE" ]; then
    echo "Error: Source image $SOURCE not found."
    exit 1
fi

echo "Generating icons from $SOURCE..."

# Standard PNGs
magick "$SOURCE" -resize 32x32 -define png:color-type=6 32x32.png
magick "$SOURCE" -resize 128x128 -define png:color-type=6 128x128.png
magick "$SOURCE" -resize 256x256 -define png:color-type=6 128x128@2x.png
magick "$SOURCE" -resize 512x512 -define png:color-type=6 icon.png

# Windows Square Logos
magick "$SOURCE" -resize 30x30 -define png:color-type=6 Square30x30Logo.png
magick "$SOURCE" -resize 44x44 -define png:color-type=6 Square44x44Logo.png
magick "$SOURCE" -resize 71x71 -define png:color-type=6 Square71x71Logo.png
magick "$SOURCE" -resize 89x89 -define png:color-type=6 Square89x89Logo.png
magick "$SOURCE" -resize 107x107 -define png:color-type=6 Square107x107Logo.png
magick "$SOURCE" -resize 142x142 -define png:color-type=6 Square142x142Logo.png
magick "$SOURCE" -resize 150x150 -define png:color-type=6 Square150x150Logo.png
magick "$SOURCE" -resize 284x284 -define png:color-type=6 Square284x284Logo.png
magick "$SOURCE" -resize 310x310 -define png:color-type=6 Square310x310Logo.png
magick "$SOURCE" -resize 50x50 -define png:color-type=6 StoreLogo.png

# ICO and ICNS
# For .ico, we explicitly include standard sizes
magick "$SOURCE" -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# For .icns, we need to generate a temporary iconset folder usually, but ImageMagick directly to icns might work if supported. 
# However, reliable .icns generation often needs `iconutil` (macOS) or specific structure. 
# Trying direct conversion first, if it fails we might need a workaround.
# Note: ImageMagick support for writing ICNS is limited/sometimes broken. 
# If this fails, we will stick to pngs and ico, and user might need to use a dedicated tool for ICNS if on Linux.
# But let's try.
magick "$SOURCE" -resize 1024x1024 icon.icns || echo "Warning: ICNS generation might have failed or be suboptimal on Linux."

echo "Icon generation complete!"
