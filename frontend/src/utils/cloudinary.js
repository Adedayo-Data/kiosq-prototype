const CLOUD_NAME = "drzcrx4he";
const UPLOAD_PRESET = "kiosk_merchant_products";

/**
 * Compresses an image client-side to max 1200px before uploading
 * to reduce bandwidth consumption on cellular connections.
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    // If not an image or cannot read, resolve original file
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Uploads a single image file unsigned to Cloudinary
 */
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Cloudinary upload failed: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Uploads up to 20 images in parallel chunks (3 at a time) to prevent mobile network dropouts.
 * onProgress callback provides (completedCount, totalCount)
 */
export async function uploadMultipleToCloudinary(files, onProgress) {
  const results = [];
  const concurrency = 3;
  let completed = 0;

  const total = files.length;

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchPromises = batch.map(async (f) => {
      const compressed = await compressImage(f);
      const url = await uploadToCloudinary(compressed);
      completed++;
      if (onProgress) onProgress(completed, total);
      return { file: f, url };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
