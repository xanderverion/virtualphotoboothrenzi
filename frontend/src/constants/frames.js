export const FRAMES = [
  {
    id: 'border-1',
    image: '/Border-1-frame.png',
    label: '1 Photo',
    name: 'Single Frame',
    maxPhotos: 1,
    aspectRatio: '2 / 3',
    photoStyle: { width: '77%', height: '47.75%', top: '12.08%', left: '11.5%' }
  },
  {
    id: 'border-2',
    image: '/Border-2-frame.png',
    label: '2 Photos',
    name: 'Double Frame',
    maxPhotos: 2,
    aspectRatio: '2 / 3',
    // The composited photo is a single stacked image (photo1 on top of photo2, no gap).
    // Each box below shows one half of that stacked image, precisely aligned to the
    // frame's actual cutout position (measured directly from Border-2-frame.png).
    photoBoxes: [
      { top: '12%', left: '11.49%', width: '76.78%', height: '23.75%', translateY: '-12.57%' },
      { top: '39.25%', left: '11.49%', width: '76.78%', height: '23.75%', translateY: '-62.57%' }
    ],
    // Live-capture guide: the band of the webcam frame (616x573) that will remain
    // visible after cropping into a photoBox. Centered vertically to match the
    // center-crop above, so what the user frames in the guide is exactly what shows.
    captureGuide: { top: '25.13%', height: '49.74%' }
  },
  {
    id: 'border-3',
    image: '/Border-3-frame.png',
    label: '3 Photos',
    name: 'Triple Frame',
    maxPhotos: 3,
    // Physical strip is 2in x 6in (401x1200px), much taller/narrower than the
    // 2:3 frames above — needed so the preview container isn't forced into 2:3.
    aspectRatio: '2 / 6',
    // The composited photo stacks 3 shots into the frame's 3 cutouts.
    // Positions measured directly from Border-3-frame.png (401x1200px canvas):
    // each cutout is 319x213px, left-aligned at x=40px, with a small maroon gap
    // between each box (matches the physical 2in x 6in strip layout).
    photoBoxes: [
      { top: '11.58%', left: '9.98%', width: '79.55%', height: '17.75%' },
      { top: '30.42%', left: '9.98%', width: '79.55%', height: '17.75%' },
      { top: '49.33%', left: '9.98%', width: '79.55%', height: '17.75%' }
    ],
    // Live-capture guide: the band of the webcam frame (616x573) that will remain
    // visible after cropping into a photoBox (rect aspect 319/213 ≈ 1.498,
    // webcam aspect 616/573 ≈ 1.075 → visible fraction = imgAspect/rectAspect ≈ 71.78%).
    captureGuide: { top: '14.11%', height: '71.78%' }
  }
];