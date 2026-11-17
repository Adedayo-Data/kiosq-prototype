/**
 * Utility to stamp images with Kiosq verified branding and generate
 * 4-photo lookbook collage covers for WhatsApp Status.
 */

// Helper to load an HTML Image element with CORS
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: retry without CORS if it failed due to strict headers
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = (err) => reject(err);
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Stamps a product image with the clean Kiosq verified stock badge:
 * "🛍️ Verified Stock • usekiosq.shop"
 */
export async function stampProductImage(imageUrl, fileName = "product.jpg") {
  try {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Standardize max width to 1080 for crisp WhatsApp display
    const maxWidth = 1080;
    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    // Draw main image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw Stamp Pill in bottom-right
    const badgeText = "🛍️ Verified Stock • usekiosq.shop";
    const fontSize = Math.max(14, Math.round(canvas.width * 0.028));
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

    const textWidth = ctx.measureText(badgeText).width;
    const paddingX = fontSize * 0.9;
    const paddingY = fontSize * 0.55;
    const pillWidth = textWidth + paddingX * 2;
    const pillHeight = fontSize + paddingY * 2;

    const margin = Math.round(canvas.width * 0.035);
    const pillX = canvas.width - pillWidth - margin;
    const pillY = canvas.height - pillHeight - margin;
    const radius = pillHeight / 2;

    // Draw dark rounded pill background with subtle shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = "rgba(10, 10, 10, 0.88)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, radius);
    ctx.fill();

    // Subtle emerald border
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#25D366";
    ctx.stroke();
    ctx.restore();

    // Draw Badge Text
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, pillX + paddingX, pillY + pillHeight / 2 + 1);

    // Convert canvas to File object
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(new File([blob], fileName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    });
  } catch (err) {
    console.warn("Could not stamp image with canvas, using raw fallback:", err);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new File([blob], fileName, { type: blob.type || "image/jpeg" });
    } catch {
      return null;
    }
  }
}

/**
 * Generates an editorial 4-photo lookbook collage cover for WhatsApp Status Slide #1.
 */
export async function generateCollageCover(items = [], businessName = "Mama Tola Textiles") {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // High resolution square format for WhatsApp status
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Clean dark ink background
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, size, size);

    // Header dimensions
    const headerHeight = 120;
    const footerHeight = 100;
    const gridY = headerHeight;
    const gridHeight = size - headerHeight - footerHeight;

    // 1. Header Bar: NEW ARRIVALS • BUSINESS NAME
    ctx.fillStyle = "#FDFBF7";
    ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const headerTitle = `🛍️ NEW ARRIVALS • ${businessName.toUpperCase()}`;
    ctx.fillText(headerTitle, size / 2, headerHeight / 2);

    // Accent line below header
    ctx.strokeStyle = "#25D366";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, headerHeight - 10);
    ctx.lineTo(size * 0.85, headerHeight - 10);
    ctx.stroke();

    // 2. Load up to 4 images
    const photosToUse = items.slice(0, 4);
    const loadedImages = await Promise.all(
      photosToUse.map(async (item) => {
        try {
          return await loadImage(item.image);
        } catch {
          return null;
        }
      })
    );

    const validImages = loadedImages.filter(Boolean);
    const gap = 12;

    // Draw images in a 2x2 grid
    if (validImages.length >= 2) {
      const cellW = (size - gap * 3) / 2;
      const cellH = (gridHeight - gap * 3) / 2;

      const positions = [
        { x: gap, y: gridY + gap },
        { x: gap * 2 + cellW, y: gridY + gap },
        { x: gap, y: gridY + gap * 2 + cellH },
        { x: gap * 2 + cellW, y: gridY + gap * 2 + cellH },
      ];

      validImages.forEach((img, idx) => {
        if (idx >= positions.length) return;
        const pos = positions[idx];

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, cellW, cellH, 16);
        ctx.clip();

        // Draw image cover-fit into cell
        const imgRatio = img.width / img.height;
        const cellRatio = cellW / cellH;
        let sx = 0,
          sy = 0,
          sWidth = img.width,
          sHeight = img.height;

        if (imgRatio > cellRatio) {
          sWidth = img.height * cellRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / cellRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, pos.x, pos.y, cellW, cellH);

        // Thin white border around each photo
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.stroke();
        ctx.restore();
      });
    } else if (validImages.length === 1) {
      // Single photo fills grid
      const img = validImages[0];
      const cellW = size - gap * 2;
      const cellH = gridHeight - gap * 2;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(gap, gridY + gap, cellW, cellH, 16);
      ctx.clip();
      ctx.drawImage(img, gap, gridY + gap, cellW, cellH);
      ctx.restore();
    }

    // 3. Footer Bar: Reassurance Call to Action
    const footerY = size - footerHeight / 2;
    ctx.fillStyle = "#FDFBF7";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️ Pay with zero fear • 100% Safe Delivery • usekiosq.shop", size / 2, footerY);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(new File([blob], "kiosq-new-arrivals-cover.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    });
  } catch (err) {
    console.error("Could not generate collage cover:", err);
    return null;
  }
}
