import sharp from 'sharp';

await sharp('icon_app_fb.png')
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('ploikhong-icon-512.png');

console.log('Done: ploikhong-icon-512.png');
