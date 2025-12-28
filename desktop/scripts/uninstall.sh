#!/bin/bash
# SelfTracker Uninstall Script
# Removes all variants and installed files

set -e

APP_NAME="SelfTracker"
INSTALL_DIR="/opt/selftracker"
DESKTOP_FILE="/usr/share/applications/selftracker.desktop"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🗑️ Uninstalling $APP_NAME...${NC}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root: sudo ./uninstall.sh${NC}"
  exit 1
fi

echo -e "${YELLOW}Removing symlinks...${NC}"
rm -f /usr/local/bin/selftracker
rm -f /usr/bin/selftracker

echo -e "${YELLOW}Removing desktop entry...${NC}"
rm -f "$DESKTOP_FILE"
rm -f /usr/share/applications/SelfTracker.desktop
rm -f ~/.local/share/applications/selftracker.desktop 2>/dev/null || true

echo -e "${YELLOW}Removing icons...${NC}"
rm -f /usr/share/icons/hicolor/256x256/apps/selftracker.png
rm -f /usr/share/icons/hicolor/*/apps/selftracker.png 2>/dev/null || true
rm -f /usr/share/pixmaps/selftracker.png 2>/dev/null || true

echo -e "${YELLOW}Removing install directory...${NC}"
rm -rf "$INSTALL_DIR"

echo -e "${YELLOW}Attempting to remove .deb package if installed...${NC}"
dpkg --remove selftracker 2>/dev/null || true
dpkg --remove SelfTracker 2>/dev/null || true

echo -e "${YELLOW}Attempting to remove .rpm package if installed...${NC}"
rpm -e selftracker 2>/dev/null || true
rpm -e SelfTracker 2>/dev/null || true

echo -e "${YELLOW}Updating desktop database...${NC}"
update-desktop-database /usr/share/applications/ 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ $APP_NAME has been completely uninstalled!${NC}"
