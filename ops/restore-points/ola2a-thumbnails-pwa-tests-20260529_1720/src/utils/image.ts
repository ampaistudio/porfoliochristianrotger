import ExifReader from "exifreader";

export const generateThumbnail = (file: File): Promise<string> => compressImage(file, 400);

export function getThumbnailUrl(url: string): string {
  if (!url || url.startsWith("data:")) return url;
  if (url.includes("unsplash.com")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=400&q=60`;
  }
  return url;
}

// Helper function to resize and compress images (reduces MB files to ~60-100KB)
export const compressImage = (file: File, maxWidth: number = 1000): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export to JPEG with optimized 60% quality
          resolve(canvas.toDataURL("image/jpeg", 0.60));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve("");
  });
};

export interface ExtractedMetadata {
  title: string;
  description: string;
  camera: string;
  lens: string;
  settings: string;
}

export const extractExifMetadata = async (file: File): Promise<ExtractedMetadata> => {
  let title = "";
  let description = "";
  let camera = "Sony Alpha 7R V";
  let lens = "FE 85mm f/1.4 GM";
  let settingsList: string[] = ["f/1.8", "1/250s", "ISO 100"];

  try {
    const tags = await ExifReader.load(file);
    camera = tags.Model?.description || tags.Make?.description || camera;
    lens = tags.LensModel?.description || tags.LensSubtype?.description || lens;
    
    let aperture = "";
    if (tags.FNumber?.description) {
      const desc = String(tags.FNumber.description);
      aperture = desc.toLowerCase().startsWith("f/") ? desc : `f/${desc}`;
    }
    const shutter = tags.ExposureTime?.description || "";
    const iso = tags.ISOSpeedRatings?.description ? `ISO ${tags.ISOSpeedRatings.description}` : "";
    const focalLength = tags.FocalLength?.description || "";
    
    const list = [];
    if (aperture) list.push(aperture);
    if (shutter) list.push(shutter);
    if (iso) list.push(iso);
    if (focalLength) list.push(focalLength);
    if (list.length > 0) settingsList = list;

    // Title candidates
    const titleCandidates = [
      tags.title, tags.Title, tags['Image Title'], tags['Object Name'],
      tags['ObjectName'], tags['Headline'], tags['XPTitle'],
      tags['ImageDescription'], tags['Image Description']
    ];
    
    for (const cand of titleCandidates) {
      if (cand && typeof cand === "object" && "description" in cand) {
        const val = String((cand as any).description).trim();
        if (val) {
          title = val;
          break;
        }
      }
    }

    // Description candidates
    const descCandidates = [
      tags.description, tags.Description, tags['Caption/Abstract'], tags['Caption'],
      tags['ImageDescription'], tags['Image Description'], tags['UserComment'], tags['User Comment']
    ];
    
    for (const cand of descCandidates) {
      if (cand && typeof cand === "object" && "description" in cand) {
        const val = String((cand as any).description).trim();
        if (val && val !== title) {
          description = val;
          break;
        }
      }
    }
  } catch (err) {
    console.warn("Exif metadata extraction error:", err);
  }

  return {
    title,
    description,
    camera,
    lens,
    settings: settingsList.join(", ")
  };
};
