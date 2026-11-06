const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const destDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(destDir, filename));
    https.get(modelsUrl + filename, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Downloaded:', filename);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(path.join(destDir, filename));
      reject(err);
    });
  });
}

async function run() {
  for (const file of files) {
    await download(file);
  }
  console.log('All models downloaded successfully!');
}

run();
