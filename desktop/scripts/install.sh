#!/bin/bash
# SelfTracker Install Script - Interactive Menu
# Downloads and installs the latest version

set -e

APP_NAME="SelfTracker"
INSTALL_DIR="/opt/selftracker"
DESKTOP_FILE="/usr/share/applications/selftracker.desktop"
GITHUB_REPO="ahmed-lotfy-dev/selfTracker"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

get_latest_version() {
  curl -s "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/desktop-v//'
}

download_file() {
  local filename="$1"
  local url="https://github.com/${GITHUB_REPO}/releases/latest/download/${filename}"
  echo -e "${YELLOW}📥 Downloading $filename...${NC}"
  if command -v wget &> /dev/null; then
    wget -q --show-progress -O "${SCRIPT_DIR}/${filename}" "$url" || { echo -e "${RED}Download failed!${NC}"; return 1; }
  elif command -v curl &> /dev/null; then
    curl -L --progress-bar -o "${SCRIPT_DIR}/${filename}" "$url" || { echo -e "${RED}Download failed!${NC}"; return 1; }
  else
    echo -e "${RED}❌ Neither wget nor curl found.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Downloaded successfully!${NC}"
}

install_deb() {
  local version="$1"
  local deb_file="SelfTracker_${version}_amd64.deb"
  local deb_path="${SCRIPT_DIR}/${deb_file}"
  
  if [ ! -f "$deb_path" ]; then
    echo -e "${YELLOW}File not found locally. Downloading...${NC}"
    download_file "$deb_file" || exit 1
  fi
  
  echo -e "${GREEN}📦 Installing .deb package...${NC}"
  dpkg -i "$deb_path"
  apt-get install -f -y 2>/dev/null || true
  echo -e "${GREEN}✅ $APP_NAME v${version} installed via .deb!${NC}"
}

install_appimage() {
  local version="$1"
  local appimage_file="SelfTracker_${version}_amd64.AppImage"
  local appimage_path="${SCRIPT_DIR}/${appimage_file}"
  
  if [ ! -f "$appimage_path" ]; then
    echo -e "${YELLOW}File not found locally. Downloading...${NC}"
    download_file "$appimage_file" || exit 1
  fi
  
  echo -e "${GREEN}📦 Installing AppImage...${NC}"
  mkdir -p "$INSTALL_DIR"
  cp "$appimage_path" "$INSTALL_DIR/$APP_NAME.AppImage"
  chmod +x "$INSTALL_DIR/$APP_NAME.AppImage"
  ln -sf "$INSTALL_DIR/$APP_NAME.AppImage" /usr/local/bin/selftracker
  
  mkdir -p /usr/share/icons/hicolor/256x256/apps/
  ICON_URL="https://raw.githubusercontent.com/ahmed-lotfy-dev/selfTracker/main/desktop/src-tauri/icons/256.png"
  curl -sL "$ICON_URL" -o /usr/share/icons/hicolor/256x256/apps/selftracker.png 2>/dev/null || true
  
  cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=$APP_NAME
Comment=Track your habits, tasks, and workouts
Exec=$INSTALL_DIR/$APP_NAME.AppImage
Icon=/usr/share/icons/hicolor/256x256/apps/selftracker.png
Type=Application
Categories=Utility;Office;
Terminal=false
StartupWMClass=SelfTracker
EOF
  update-desktop-database /usr/share/applications/ 2>/dev/null || true
  gtk-update-icon-cache /usr/share/icons/hicolor/ 2>/dev/null || true
  echo -e "${GREEN}✅ $APP_NAME v${version} installed as AppImage!${NC}"
}

install_rpm() {
  local version="$1"
  local rpm_file="SelfTracker-${version}-1.x86_64.rpm"
  local rpm_path="${SCRIPT_DIR}/${rpm_file}"
  
  if [ ! -f "$rpm_path" ]; then
    echo -e "${YELLOW}File not found locally. Downloading...${NC}"
    download_file "$rpm_file" || exit 1
  fi
  
  echo -e "${GREEN}📦 Installing .rpm package...${NC}"
  if command -v dnf &> /dev/null; then
    dnf install -y "$rpm_path"
  elif command -v rpm &> /dev/null; then
    rpm -i "$rpm_path"
  else
    echo -e "${RED}❌ No RPM package manager found.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ $APP_NAME v${version} installed via .rpm!${NC}"
}

install_tarball() {
  local version="$1"
  local tarball_file="SelfTracker_${version}_linux_x86_64.tar.gz"
  local tarball_path="${SCRIPT_DIR}/${tarball_file}"
  
  if [ ! -f "$tarball_path" ]; then
    echo -e "${YELLOW}File not found locally. Downloading...${NC}"
    download_file "$tarball_file" || exit 1
  fi
  
  echo -e "${GREEN}📦 Installing from tar.gz...${NC}"
  TEMP_DIR=$(mktemp -d)
  tar -xzf "$tarball_path" -C "$TEMP_DIR"
  
  BINARY_PATH=$(find "$TEMP_DIR" -name "selftracker" -type f -executable 2>/dev/null | head -1)
  if [ -z "$BINARY_PATH" ]; then
    echo -e "${RED}❌ Binary not found in archive!${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
  fi
  
  mkdir -p "$INSTALL_DIR"
  cp "$BINARY_PATH" "$INSTALL_DIR/$APP_NAME"
  chmod +x "$INSTALL_DIR/$APP_NAME"
  ln -sf "$INSTALL_DIR/$APP_NAME" /usr/local/bin/selftracker
  
  mkdir -p /usr/share/icons/hicolor/256x256/apps/
  ICON_SRC=$(find "$TEMP_DIR" -name "*.png" -type f 2>/dev/null | head -1)
  if [ -n "$ICON_SRC" ]; then
    cp "$ICON_SRC" /usr/share/icons/hicolor/256x256/apps/selftracker.png
  else
    ICON_URL="https://raw.githubusercontent.com/ahmed-lotfy-dev/selfTracker/main/desktop/src-tauri/icons/256.png"
    curl -sL "$ICON_URL" -o /usr/share/icons/hicolor/256x256/apps/selftracker.png 2>/dev/null || true
  fi
  
  cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=$APP_NAME
Comment=Track your habits, tasks, and workouts
Exec=/usr/local/bin/selftracker
Icon=/usr/share/icons/hicolor/256x256/apps/selftracker.png
Type=Application
Categories=Utility;Office;
Terminal=false
StartupWMClass=SelfTracker
EOF
  
  update-desktop-database /usr/share/applications/ 2>/dev/null || true
  gtk-update-icon-cache /usr/share/icons/hicolor/ 2>/dev/null || true
  rm -rf "$TEMP_DIR"
  echo -e "${GREEN}✅ $APP_NAME v${version} installed from tar.gz!${NC}"
}

show_menu() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║         ${GREEN}SelfTracker Installer${BLUE}                  ║${NC}"
  echo -e "${BLUE}╠════════════════════════════════════════════════╣${NC}"
  echo -e "${BLUE}║${NC}  1) Install .deb package (Debian/Ubuntu)       ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  2) Install AppImage (Universal Linux)         ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  3) Install .rpm package (Fedora/RHEL)         ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  4) Install tar.gz binary (Arch/AUR)           ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  5) Download all variants                      ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  6) Exit                                       ${BLUE}║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""
}

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root: sudo ./install.sh${NC}"
  exit 1
fi

echo -e "${YELLOW}🔍 Fetching latest version...${NC}"
VERSION=$(get_latest_version)
if [ -z "$VERSION" ]; then
  VERSION="1.1.3"
  echo -e "${YELLOW}Could not fetch version, using: $VERSION${NC}"
else
  echo -e "${GREEN}Latest version: $VERSION${NC}"
fi

while true; do
  show_menu
  read -p "Select option [1-6]: " choice
  
  case $choice in
    1)
      install_deb "$VERSION"
      break
      ;;
    2)
      install_appimage "$VERSION"
      break
      ;;
    3)
      install_rpm "$VERSION"
      break
      ;;
    4)
      install_tarball "$VERSION"
      break
      ;;
    5)
      echo -e "${YELLOW}📥 Downloading all variants...${NC}"
      download_file "SelfTracker_${VERSION}_amd64.deb"
      download_file "SelfTracker_${VERSION}_amd64.AppImage"
      download_file "SelfTracker-${VERSION}-1.x86_64.rpm"
      download_file "SelfTracker_${VERSION}_linux_x86_64.tar.gz"
      echo -e "${GREEN}✅ All files downloaded to: $SCRIPT_DIR${NC}"
      echo -e "${YELLOW}Run this script again to install.${NC}"
      break
      ;;
    6)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option. Please select 1-6.${NC}"
      ;;
  esac
done

cp "${SCRIPT_DIR}/uninstall.sh" "$INSTALL_DIR/" 2>/dev/null || true
echo ""
echo -e "${GREEN}Run 'selftracker' to start the app.${NC}"
echo -e "${GREEN}Uninstall with: sudo $INSTALL_DIR/uninstall.sh${NC}"

