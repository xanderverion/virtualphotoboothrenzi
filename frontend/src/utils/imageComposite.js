// `photos` sekarang adalah array of { src, mirror } — bukan lagi array of
// string. Tiap foto membawa flag mirror MILIKNYA SENDIRI (dicatat saat
// capture, tergantung kamera depan/belakang dipakai saat itu), supaya user
// bebas gonta-ganti kamera antar-jepretan dalam satu sesi frame Double/Triple
// dan tiap foto tetap ter-flip dengan benar sesuai kameranya masing-masing.
export const generateCompositedImage = (photos, frame, callback) => {
  const frameImg = new Image();
  frameImg.crossOrigin = "anonymous";
  frameImg.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;
    const ctx = canvas.getContext('2d');

    const drawPhoto = (img, rect, mirror) => {
      const imgAspect = img.width / img.height;
      const rectAspect = rect.width / rect.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > rectAspect) {
        drawHeight = rect.height;
        drawWidth = img.width * (rect.height / img.height);
        offsetX = rect.x - (drawWidth - rect.width) / 2;
        offsetY = rect.y;
      } else {
        drawWidth = rect.width;
        drawHeight = img.height * (rect.width / img.width);
        offsetX = rect.x;
        offsetY = rect.y - (drawHeight - rect.height) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();

      // Flip horizontal HANYA kalau foto INI diambil dari kamera depan
      // (preview-nya dulu di-mirror). Kamera belakang tidak pernah
      // di-mirror di preview, jadi tidak boleh di-flip di sini juga —
      // kalau tetap di-flip, hasil cetak kamera belakang akan terbalik
      // (mis. teks di background jadi cermin) dibanding apa yang user lihat.
      if (mirror) {
        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(rect.x + rect.width / 2), -(rect.y + rect.height / 2));
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    };

    const parsePercent = (val, max) => (parseFloat(val) / 100) * max;

    const loadImagesAndDraw = async () => {
      try {
        if (frame.maxPhotos === 1) {
          const photoImg = new Image();
          await new Promise((resolve, reject) => {
            photoImg.onload = resolve;
            photoImg.onerror = reject;
            photoImg.src = photos[0].src;
          });
          const rect = {
            x: parsePercent(frame.photoStyle.left, canvas.width),
            y: parsePercent(frame.photoStyle.top, canvas.height),
            width: parsePercent(frame.photoStyle.width, canvas.width),
            height: parsePercent(frame.photoStyle.height, canvas.height)
          };
          drawPhoto(photoImg, rect, photos[0].mirror);
        } else if (frame.photoBoxes && frame.photoBoxes.length > 0) {
          // Generic multi-photo branch: works for 2, 3, or any number of
          // cutouts defined in frame.photoBoxes, matched 1:1 with photos[].
          const imgs = await Promise.all(
            frame.photoBoxes.map((_, i) => new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = photos[i].src;
            }))
          );

          frame.photoBoxes.forEach((box, i) => {
            const rect = {
              x: parsePercent(box.left, canvas.width),
              y: parsePercent(box.top, canvas.height),
              width: parsePercent(box.width, canvas.width),
              height: parsePercent(box.height, canvas.height)
            };
            drawPhoto(imgs[i], rect, photos[i].mirror);
          });
        }

        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.9));
      } catch (error) {
        console.error("Error drawing composite image:", error);
        callback(photos[0].src); // Fallback
      }
    };

    loadImagesAndDraw();
  };
  frameImg.onerror = () => callback(photos[0].src); // Fallback
  frameImg.src = frame.image;
};