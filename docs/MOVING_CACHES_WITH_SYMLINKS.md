# Moving Cache Directories with Symbolic Links

So I was running low on space on my home partition, and I realized that cache directories like `.cargo`, `.npm`, `.expo`, and others were eating up gigabytes of valuable SSD space. Since I have a large HDD mounted at `/mnt/hdd/`, I thought: why not move these caches there and just symlink them?

**Spoiler alert:** It works perfectly! Let me show you how.

## Why Use Symbolic Links?

Symbolic links (`ln -s`) are like shortcuts that are transparent to applications. When a program tries to access `/home/alotfy/.cargo`, it automatically follows the symlink to the actual location on your HDD without even knowing the difference.

**Benefits:**
- ✅ Free up precious SSD space on your home partition
- ✅ Keep large cache files on spacious HDD storage
- ✅ Applications work exactly as before - no config changes needed
- ✅ Easy to reverse if needed

**Trade-offs:**
- ⚠️ Slightly slower cache access (HDD vs SSD, but caches are already I/O intensive)
- ⚠️ If the HDD isn't mounted, applications might fail

## Before You Start

### Check Current Cache Sizes

Let's see how much space we're actually using:

```bash
# Check individual cache sizes
du -sh ~/.cargo
du -sh ~/.npm
du -sh ~/.expo
du -sh ~/.gradle
du -sh ~/.cache

# See total
du -sh ~/.cargo ~/.npm ~/.expo ~/.gradle ~/.cache | awk '{sum+=$1} END {print sum}'
```

![Cache size output](./screenshots/cache-sizes-placeholder.png)
*Screenshot: Output showing cache directory sizes*

**Common cache locations you might want to move:**
- `~/.cargo` - Rust packages and build artifacts
- `~/.npm` - Node.js packages
- `~/.expo` - Expo CLI cache
- `~/.gradle` - Gradle build cache (already mentioned in build optimizations!)
- `~/.cache` - Various application caches
- `~/.bun` - Bun runtime cache
- `~/.local/share/pnpm` - PNPM store

---

## The Safe Migration Process

I'll walk you through moving `.cargo`, `.npm`, and `.expo` as examples. Repeat these steps for any other caches you want to move.

### Step 1: Create the Cache Directory on HDD

First, let's create a organized location for all our caches:

```bash
# Create a dedicated caches directory
mkdir -p /mnt/hdd/caches

# Verify it's writable
touch /mnt/hdd/caches/test.txt && rm /mnt/hdd/caches/test.txt
```

### Step 2: Stop Running Processes

**Important:** Make sure no applications are currently using these caches!

```bash
# Stop any running Node/npm processes
pkill -f npm
pkill -f node

# Stop Expo if running
pkill -f expo

# Stop Gradle daemon
~/.gradle/wrapper/dists/gradle-*/*/bin/gradle --stop 2>/dev/null || true
```

### Step 3: Move the Cache Directories

Now let's carefully move each cache:

#### Moving .cargo

```bash
# Check if .cargo exists and has content
if [ -d ~/.cargo ]; then
    # Move to HDD
    mv ~/.cargo /mnt/hdd/caches/cargo
    
    # Create symlink
    ln -s /mnt/hdd/caches/cargo ~/.cargo
    
    # Verify
    ls -la ~ | grep cargo
fi
```

Expected output:
```
lrwxrwxrwx 1 alotfy alotfy 24 Dec 21 18:30 .cargo -> /mnt/hdd/caches/cargo
```

![Symlink verification](./screenshots/cargo-symlink-placeholder.png)
*Screenshot: The symlink showing in ls -la output*

#### Moving .npm

```bash
# Move npm cache
if [ -d ~/.npm ]; then
    mv ~/.npm /mnt/hdd/caches/npm
    ln -s /mnt/hdd/caches/npm ~/.npm
    ls -la ~ | grep npm
fi
```

#### Moving .expo

```bash
# Move Expo cache
if [ -d ~/.expo ]; then
    mv ~/.expo /mnt/hdd/caches/expo
    ln -s /mnt/hdd/caches/expo ~/.expo
    ls -la ~ | grep expo
fi
```

#### Moving .gradle (If desired)

```bash
# Move Gradle cache
if [ -d ~/.gradle ]; then
    mv ~/.gradle /mnt/hdd/caches/gradle
    ln -s /mnt/hdd/caches/gradle ~/.gradle
    ls -la ~ | grep gradle
fi
```

### Step 4: Set Correct Permissions

Ensure the moved caches have the right permissions:

```bash
# Set ownership (replace 'alotfy' with your username)
sudo chown -R alotfy:alotfy /mnt/hdd/caches/

# Set permissions
chmod -R 755 /mnt/hdd/caches/
```

### Step 5: Test Everything

Let's verify that applications can still use the caches:

```bash
# Test cargo (if you have Rust installed)
cargo --version

# Test npm
npm --version

# Test bun
bun --version

# Test that downloads/installs still work
npm cache verify
```

If everything works, you're golden! ✨

---

## Complete Migration Script

Here's a complete script that does everything safely:

```bash
#!/bin/bash

# Configuration
CACHE_DIR="/mnt/hdd/caches"
HOME_DIR="$HOME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create cache directory
echo -e "${YELLOW}Creating cache directory at $CACHE_DIR${NC}"
mkdir -p "$CACHE_DIR"

# Function to move and symlink a directory
move_and_link() {
    local dir_name=$1
    local source="$HOME_DIR/$dir_name"
    local dest="$CACHE_DIR/${dir_name#.}"  # Remove leading dot
    
    if [ -d "$source" ] && [ ! -L "$source" ]; then
        echo -e "${YELLOW}Moving $dir_name...${NC}"
        
        # Calculate size before moving
        size=$(du -sh "$source" | cut -f1)
        echo "  Size: $size"
        
        # Move directory
        mv "$source" "$dest"
        
        # Create symlink
        ln -s "$dest" "$source"
        
        # Verify
        if [ -L "$source" ]; then
            echo -e "${GREEN}  ✓ Successfully moved and linked $dir_name${NC}"
        else
            echo -e "${RED}  ✗ Failed to create symlink for $dir_name${NC}"
        fi
    elif [ -L "$source" ]; then
        echo -e "${GREEN}  ✓ $dir_name is already a symlink${NC}"
    else
        echo -e "${YELLOW}  - $dir_name does not exist, skipping${NC}"
    fi
}

# Stop running processes
echo -e "${YELLOW}Stopping running processes...${NC}"
pkill -f npm 2>/dev/null
pkill -f node 2>/dev/null
pkill -f expo 2>/dev/null

# Move caches
echo ""
move_and_link ".cargo"
move_and_link ".npm"
move_and_link ".expo"
move_and_link ".gradle"
move_and_link ".bun"
move_and_link ".cache"

# Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chmod -R 755 "$CACHE_DIR"

# Summary
echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Migration complete!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo "Saved space in home directory:"
du -sh "$CACHE_DIR"

echo ""
echo "Verify symlinks with: ls -la ~ | grep ' -> '"
```

Save this as `migrate-caches.sh`, make it executable, and run it:

```bash
chmod +x migrate-caches.sh
./migrate-caches.sh
```

![Script execution](./screenshots/migration-script-placeholder.png)
*Screenshot: The migration script running successfully*

---

## Verifying Everything Works

After migration, verify your symlinks:

```bash
# List all symlinks in home directory
ls -la ~ | grep ' -> '
```

You should see something like:
```
lrwxrwxrwx 1 alotfy alotfy 24 Dec 21 18:30 .cargo -> /mnt/hdd/caches/cargo
lrwxrwxrwx 1 alotfy alotfy 22 Dec 21 18:30 .npm -> /mnt/hdd/caches/npm
lrwxrwxrwx 1 alotfy alotfy 23 Dec 21 18:30 .expo -> /mnt/hdd/caches/expo
```

### Test Each Tool

```bash
# Test npm
npm install -g npm  # Should use cache transparently

# Test cargo (if installed)
cargo search serde  # Should use cache

# Test Expo
expo --version

# Test build process
cd /path/to/your/project
npm install  # Should work normally
```

---

## Troubleshooting

### "No such file or directory" errors

If applications can't find the cache:

1. Check the symlink exists: `ls -la ~/.cargo`
2. Check the target exists: `ls -la /mnt/hdd/caches/cargo`
3. Check the HDD is mounted: `mount | grep /mnt/hdd`

### "Permission denied" errors

Fix permissions:
```bash
sudo chown -R $USER:$USER /mnt/hdd/caches/
chmod -R 755 /mnt/hdd/caches/
```

### Reverting the Changes

If you need to move everything back:

```bash
# Remove symlink
rm ~/.cargo

# Move directory back
mv /mnt/hdd/caches/cargo ~/.cargo

# Repeat for each cache
```

Or use this script:

```bash
#!/bin/bash
for dir in cargo npm expo gradle bun cache; do
    if [ -L "$HOME/.$dir" ]; then
        rm "$HOME/.$dir"
        mv "/mnt/hdd/caches/$dir" "$HOME/.$dir"
        echo "Restored .$dir"
    fi
done
```

---

## Auto-Mount Considerations

**Important:** If your `/mnt/hdd` isn't automatically mounted at boot, applications will fail when they try to access the caches!

### Check if HDD auto-mounts:

```bash
cat /etc/fstab | grep /mnt/hdd
```

If nothing shows up, you need to add it to `/etc/fstab`.

### Add to fstab (example):

```bash
# First, find the UUID of your HDD
sudo blkid | grep /mnt/hdd

# Add to /etc/fstab (replace with your actual UUID)
UUID=your-uuid-here /mnt/hdd ext4 defaults 0 2
```

**Make sure this is correct before rebooting!** A wrong fstab entry can prevent your system from booting.

---

## Results

After moving these caches, here's what I freed up:

| Cache | Size | Location |
|-------|------|----------|
| .cargo | 3.2 GB | → /mnt/hdd/caches/cargo |
| .npm | 1.8 GB | → /mnt/hdd/caches/npm |
| .expo | 450 MB | → /mnt/hdd/caches/expo |
| .gradle | 2.1 GB | → /mnt/hdd/caches/gradle |
| .bun | 920 MB | → /mnt/hdd/caches/bun |
| **Total** | **8.47 GB** | **Freed from SSD!** |

![Disk space comparison](./screenshots/disk-space-saved-placeholder.png)
*Screenshot: Before and after disk space in home partition*

---

## Conclusion

Symbolic links are a powerful tool for managing disk space without disrupting your workflow. All your applications continue working exactly as before, but now your cache files live on spacious HDD storage instead of cramming your precious SSD space.

Just remember to ensure your HDD is always mounted (add it to `/etc/fstab`), and you're good to go!

Happy caching! 💾✨

---

## Quick Reference

```bash
# Create target directory
mkdir -p /mnt/hdd/caches

# Move and symlink pattern
mv ~/.cache_name /mnt/hdd/caches/cache_name
ln -s /mnt/hdd/caches/cache_name ~/.cache_name

# Verify symlink
ls -la ~ | grep cache_name

# Test it works
command --version  # or appropriate test command
```
