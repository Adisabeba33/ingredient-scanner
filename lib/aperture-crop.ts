/**
 * Which pixels of the sensor frame are behind the aiming rectangle on screen.
 *
 * The preview is drawn `object-cover`, so what the phone shows is not what the
 * sensor sends: a landscape 1920×1080 frame in a portrait preview is scaled up
 * until it fills the box and the sides fall off. Anything that wants to work on
 * "what is in the frame the operator aimed" has to undo that.
 *
 * Worth doing rather than processing the whole picture: the crop is a fraction
 * of the pixels — cheap enough to run on every frame of a live camera — and it
 * is the region at FULL sensor resolution, which is what a decoder needs. The
 * alternative, downscaling the whole frame, throws away the resolution that
 * decides whether a barcode reads at all.
 */
export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface Size {
  width: number;
  height: number;
}

export function apertureCrop(
  frame: Size,
  box: Size,
  aperture: Size
): CropRect {
  if (!frame.width || !frame.height || !box.width || !box.height) {
    return { sx: 0, sy: 0, sw: frame.width, sh: frame.height };
  }
  // object-cover: scale until BOTH dimensions are covered — hence max, not min.
  const scale = Math.max(box.width / frame.width, box.height / frame.height);
  // The aperture is centred in the box and the frame is centred under it, so
  // the crop is centred too; only its size has to come back through the scale.
  const sw = Math.min(frame.width, aperture.width / scale);
  const sh = Math.min(frame.height, aperture.height / scale);
  return {
    sx: Math.max(0, (frame.width - sw) / 2),
    sy: Math.max(0, (frame.height - sh) / 2),
    sw,
    sh,
  };
}
