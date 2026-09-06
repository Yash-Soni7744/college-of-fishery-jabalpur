const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const backupFilePath = path.join(__dirname, '..', 'backups', 'live_snapshots', 'baseline_clean_backup.json');
const imagesDir = path.join(__dirname, '..', 'backups', 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const raw = fs.readFileSync(backupFilePath, 'utf8');

// Regex to find all Cloudinary and image URLs
const urlRegex = /https?:\/\/[^"'\s\\]+\.(jpg|jpeg|png|webp|gif|svg)/gi;
const matches = raw.match(urlRegex) || [];
const uniqueUrls = Array.from(new Set(matches));

console.log(`Found ${uniqueUrls.length} unique image URLs in baseline backup.`);

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function backupAllImages() {
  let count = 0;
  for (const url of uniqueUrls) {
    try {
      const urlObj = new URL(url);
      const filename = path.basename(urlObj.pathname);
      const destPath = path.join(imagesDir, filename);

      console.log(`Downloading: ${filename}...`);
      await downloadFile(url, destPath);
      count++;
    } catch (err) {
      console.warn(`Failed to download ${url}:`, err.message);
    }
  }
  console.log(`\n🎉 Successfully backed up ${count}/${uniqueUrls.length} images to ${imagesDir}`);
}

backupAllImages();
