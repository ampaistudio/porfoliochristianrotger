import React, { useState, useRef } from "react";
import { 
  Camera, 
  Trash2, 
  Plus, 
  Sliders, 
  Settings, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  PlusCircle, 
  Image as ImageIcon,
  Share2,
  Mail,
  Instagram,
  Twitter,
  ExternalLink,
  MessageSquare,
  Upload,
  Pencil,
  Download,
  Database
} from "lucide-react";
import { Photo, PortfolioConfig, ClientReviewSession } from "../types";
import ExifReader from "exifreader";

// Función helper para redimensionar y comprimir imágenes (reduce archivos MB a ~60-100KB)
const compressImage = (file: File, maxWidth: number = 1000): Promise<string> => {
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
          // Exportar a JPEG con compresión optimizada al 60%
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

const CATEGORY_OPTIONS = [
  { value: "Vida Silvestre | Wildlife", label: "Vida Silvestre / Wildlife" },
  { value: "Paisaje | Landscape", label: "Paisaje / Landscape" },
  { value: "Costa Rica | Costa Rica", label: "Costa Rica" },
  { value: "Antártida | Antarctica", label: "Antártida / Antarctica" },
  { value: "South Georgias | South Georgias", label: "South Georgias" },
  { value: "Europa | Europe", label: "Europa / Europe" },
  { value: "Ushuaia | Ushuaia", label: "Ushuaia" },
  { value: "Sport | Sport", label: "Sport" },
  { value: "Retrato | Portrait", label: "Retrato / Portrait" },
  { value: "Moda y Editorial | Fashion & Editorial", label: "Moda y Editorial / Fashion & Editorial" },
  { value: "Casamiento y Evento | Wedding & Event", label: "Casamiento y Evento / Wedding & Event" },
  { value: "Otro | Other", label: "Otro / Other" }
];

interface PhotographerDashboardProps {
  photos: Photo[];
  onUpdatePhotos: (photos: Photo[]) => void;
  config: PortfolioConfig;
  onUpdateConfig: (config: PortfolioConfig) => void;
  reviews: ClientReviewSession[];
  onClearReviews: () => void;
  onSimulateClientView: () => void;
  clientLinkUrl: string;
  onImportAllData?: (photos: Photo[], config: PortfolioConfig, reviews: ClientReviewSession[]) => void;
  adminPassword?: string;
  onUpdateAdminPassword?: (pwd: string) => void;
  authorizedEmails?: string[];
  onUpdateAuthorizedEmails?: (emails: string[]) => void;
  googleClientId?: string;
  onUpdateGoogleClientId?: (id: string) => void;
}

export default function PhotographerDashboard({
  photos,
  onUpdatePhotos,
  config,
  onUpdateConfig,
  reviews,
  onClearReviews,
  onSimulateClientView,
  clientLinkUrl,
  onImportAllData,
  adminPassword = "admin",
  onUpdateAdminPassword,
  authorizedEmails = ["rotgerchristian@gmail.com"],
  onUpdateAuthorizedEmails,
  googleClientId = "",
  onUpdateGoogleClientId,
}: PhotographerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "settings" | "reviews">("gallery");
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  // Photo Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoDesc, setNewPhotoDesc] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState("Vida Silvestre | Wildlife");
  const [newPhotoCamera, setNewPhotoCamera] = useState("Sony Alpha 7R V");
  const [newPhotoLens, setNewPhotoLens] = useState("FE 85mm f/1.4 GM");
  const [newPhotoSettings, setNewPhotoSettings] = useState("f/1.8, 1/250s, ISO 100");
  const [newPhotoEditorial, setNewPhotoEditorial] = useState("");
  const [newPhotoSuggested, setNewPhotoSuggested] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [batchUploadStatus, setBatchUploadStatus] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  // Drag and Drop File state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curated Preset Unsplash Links for Quick Setup
  const sampleUnsplashPresets = [
    { label: "Moda Étnica", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200", cat: "Moda y Editorial | Fashion & Editorial" },
    { label: "Retrato Melancólico", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200", cat: "Retrato | Portrait" },
    { label: "Espacio Minimalista", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", cat: "Paisaje | Landscape" },
    { label: "Boda Atardecer", url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200", cat: "Casamiento y Evento | Wedding & Event" }
  ];

  // --- SEGURIDAD: EXPORTACIÓN E IMPORTACIÓN DE RESPALDO LOCAL DETALLADO ---
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        photos,
        config,
        reviews,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `respaldo_portafolio_ph_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupMessage({
        text: "✨ ¡Copia de seguridad local exportada con éxito! Se ha descargado tu archivo de respaldo .json.",
        type: "success"
      });
      setTimeout(() => setBackupMessage(null), 12000);
    } catch (err: any) {
      console.error("Error al exportar el respaldo:", err);
      setBackupMessage({
        text: `Error al generar la copia de seguridad: ${err.message || err}`,
        type: "error"
      });
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("El archivo no contiene un formato de respaldo JSON válido.");
        }

        const importedPhotos = parsed.photos;
        const importedConfig = parsed.config;
        const importedReviews = parsed.reviews || [];

        if (!Array.isArray(importedPhotos)) {
          throw new Error("La copia de seguridad no contiene fotos válidas.");
        }

        if (!importedConfig || typeof importedConfig !== "object" || !importedConfig.photographerName) {
          throw new Error("La copia de seguridad no contiene una plantilla de configuración de perfil.");
        }

        if (onImportAllData) {
          onImportAllData(importedPhotos, importedConfig, importedReviews);
          setBackupMessage({
            text: `✨ ¡Restauración exitosa! Se cargaron ${importedPhotos.length} fotos y la configuración del perfil de "${importedConfig.photographerName}". Todos tus datos están seguros.`,
            type: "success"
          });
          setTimeout(() => setBackupMessage(null), 15000);
        } else {
          throw new Error("Falta el callback de restauración en el componente raíz.");
        }
      } catch (err: any) {
        console.error("Error al restaurar el respaldo:", err);
        setBackupMessage({
          text: `⚠️ Error de validación al importar el archivo: ${err.message || 'JSON corrupto'}`,
          type: "error"
        });
      }
    };
    reader.onerror = () => {
      setBackupMessage({ text: "Error de lectura del archivo.", type: "error" });
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset
  };

  // Calculations
  const approvedTotalCount = reviews.reduce((sum, r) => sum + r.feedbacks.filter(f => f.approved).length, 0);
  const reviewedTotalCount = reviews.reduce((sum, r) => sum + r.feedbacks.length, 0);
  const approvalPercent = reviewedTotalCount > 0 ? Math.round((approvedTotalCount / reviewedTotalCount) * 100) : 100;

  // File Upload Handlers (compliant with usability standards for drag and drop)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) {
      alert("Por favor cargue imágenes válidas (.jpg, .png, .jpeg, .webp)");
      return;
    }

    const unsupported = files.filter(f => {
      const fn = f.name.toLowerCase();
      return fn.endsWith(".heic") || fn.endsWith(".heif") || f.type.includes("heic") || f.type.includes("heif") ||
             fn.endsWith(".cr2") || fn.endsWith(".nef") || fn.endsWith(".arw") || fn.endsWith(".dng") || fn.endsWith(".raw");
    });

    if (unsupported.length > 0) {
      alert(`⚠️ Se detectaron ${unsupported.length} archivo(s) en formato RAW o HEIC no soportados. Se omitirán de la carga.`);
    }

    const validFiles = files.filter(f => !unsupported.includes(f));
    if (validFiles.length === 0) return;

    if (validFiles.length === 1) {
      // Caso de 1 sola foto: cargarla en el formulario para revisión
      await handleFile(validFiles[0]);
    } else {
      // Caso de carga múltiple de fotos: procesamiento por lotes automático directo
      setIsProcessingImage(true);
      const newPhotosList: Photo[] = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setBatchUploadStatus({
          current: i + 1,
          total: validFiles.length,
          fileName: file.name
        });

        try {
          let extractedTitle = "";
          let extractedDesc = "";
          let cameraModel = "Sony Alpha 7R V";
          let lensModel = "FE 85mm f/1.4 GM";
          let techSpecsList: string[] = ["f/1.8", "1/250s", "ISO 100"];

          // 1. Extraer EXIF usando ExifReader
          try {
            const tags = await ExifReader.load(file);
            cameraModel = tags.Model?.description || tags.Make?.description || "";
            lensModel = tags.LensModel?.description || tags.LensSubtype?.description || "";
            
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
            if (list.length > 0) techSpecsList = list;

            // Extraer Título (Lightroom Title / IPTC Object Name / XPTitle...)
            const titleCandidates = [
              tags.title,
              tags.Title,
              tags['Image Title'],
              tags['Object Name'],
              tags['ObjectName'],
              tags['Headline'],
              tags['XPTitle'],
              tags['ImageDescription'],
              tags['Image Description']
            ];
            
            for (const cand of titleCandidates) {
              if (cand && typeof cand === "object" && "description" in cand) {
                const val = String((cand as any).description).trim();
                if (val) {
                  extractedTitle = val;
                  break;
                }
              }
            }

            // Extraer Descripción (Caption)
            const descCandidates = [
              tags.description,
              tags.Description,
              tags['Caption/Abstract'],
              tags['Caption'],
              tags['ImageDescription'],
              tags['Image Description'],
              tags['UserComment'],
              tags['User Comment']
            ];
            
            for (const cand of descCandidates) {
              if (cand && typeof cand === "object" && "description" in cand) {
                const val = String((cand as any).description).trim();
                if (val && val !== extractedTitle) {
                  extractedDesc = val;
                  break;
                }
              }
            }

          } catch (exifErr) {
            console.warn("No metadata fetched for", file.name, exifErr);
          }

          // 2. Comprimir imagen a base64
          const compressedUrl = await compressImage(file);
          
          const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const finalTitle = extractedTitle || cleanName;

          const newPhoto: Photo = {
            id: `photo_${Date.now()}_batch_${i}_${Math.random().toString(36).substr(2, 5)}`,
            url: compressedUrl,
            title: finalTitle,
            description: extractedDesc || "",
            category: newPhotoCategory, // Usa la categoría o categorías actualmente seleccionadas
            date: new Date().toISOString().split("T")[0],
            camera: cameraModel || "Sony Alpha 7R V",
            lens: lensModel || "FE 85mm f/1.4 GM",
            settings: techSpecsList.join(", ") || "f/1.8, 1/250s, ISO 100",
            editorialReview: "",
            suggestedSettings: "",
          };

          newPhotosList.push(newPhoto);
        } catch (singleErr) {
          console.error("Error processing file", file.name, singleErr);
        }
      }

      if (newPhotosList.length > 0) {
        onUpdatePhotos([...newPhotosList, ...photos]);
        setBackupMessage({
          text: `✨ ¡Carga múltiple completada! Se procesaron e importaron correctamente ${newPhotosList.length} imágenes con sus metadatos EXIF.`,
          type: "success"
        });
        setTimeout(() => setBackupMessage(null), 12000);
        resetForm();
      }
      
      setBatchUploadStatus(null);
      setIsProcessingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(e.target.files);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor cargue una imagen válida (.jpg, .png, .jpeg, .webp)");
      return;
    }

    const fileName = file.name.toLowerCase();
    const isHEIC = fileName.endsWith(".heic") || fileName.endsWith(".heif") || file.type.includes("heic") || file.type.includes("heif");
    const isRAW = fileName.endsWith(".cr2") || fileName.endsWith(".nef") || fileName.endsWith(".arw") || fileName.endsWith(".dng") || fileName.endsWith(".raw");

    if (isHEIC || isRAW) {
      alert("⚠️ Los formatos RAW (.NEF, .CR2, .ARW, .DNG) y Apple HEIC no se pueden procesar/renderizar directamente en el navegador web. Por favor expórtalos o conviértelos a JPG o PNG de antemano.");
      return;
    }

    setIsProcessingImage(true);

    try {
      let extractedTitle = "";
      let extractedDesc = "";

      // 1. Extraer metadatos EXIF usando ExifReader
      try {
        const tags = await ExifReader.load(file);
        
        // Obtener Modelo de Cámara
        const cameraModel = tags.Model?.description || tags.Make?.description || "";
        
        // Obtener Modelo de Lente
        const lensModel = tags.LensModel?.description || tags.LensSubtype?.description || "";
        
        // Obtener Parámetros Técnicos (Apertura, Obturación, ISO, Longitud focal)
        let aperture = "";
        if (tags.FNumber?.description) {
          const desc = String(tags.FNumber.description);
          aperture = desc.toLowerCase().startsWith("f/") ? desc : `f/${desc}`;
        }
        
        const shutter = tags.ExposureTime?.description || "";
        const iso = tags.ISOSpeedRatings?.description ? `ISO ${tags.ISOSpeedRatings.description}` : "";
        const focalLength = tags.FocalLength?.description || "";
        
        const techSpecsList = [];
        if (aperture) techSpecsList.push(aperture);
        if (shutter) techSpecsList.push(shutter);
        if (iso) techSpecsList.push(iso);
        if (focalLength) techSpecsList.push(focalLength);

        // Extraer Título (Lightroom Title / IPTC Object Name / XMP title / Headline)
        const titleCandidates = [
          tags.title,
          tags.Title,
          tags['Image Title'],
          tags['Object Name'],
          tags['ObjectName'],
          tags['Headline'],
          tags['XPTitle'],
          tags['ImageDescription'],
          tags['Image Description']
        ];
        
        for (const cand of titleCandidates) {
          if (cand && typeof cand === "object" && "description" in cand) {
            const val = String((cand as any).description).trim();
            if (val) {
              extractedTitle = val;
              break;
            }
          }
        }
        
        // Extraer Descripción / Comentario (Lightroom Caption / IPTC Caption / XMP description)
        const descCandidates = [
          tags.description,
          tags.Description,
          tags['Caption/Abstract'],
          tags['Caption'],
          tags['ImageDescription'],
          tags['Image Description'],
          tags['UserComment'],
          tags['User Comment']
        ];
        
        for (const cand of descCandidates) {
          if (cand && typeof cand === "object" && "description" in cand) {
            const val = String((cand as any).description).trim();
            // Evitar duplicar el título en la descripción si es exactamente idéntico
            if (val && val !== extractedTitle) {
              extractedDesc = val;
              break;
            }
          }
        }
        
        // Actualizar estados de formulario con EXIF detectado
        if (cameraModel) setNewPhotoCamera(cameraModel);
        if (lensModel) setNewPhotoLens(lensModel);
        if (techSpecsList.length > 0) setNewPhotoSettings(techSpecsList.join(", "));
        
      } catch (exifErr) {
        console.warn("No se pudieron extraer metadatos EXIF de este archivo:", exifErr);
      }

      // 2. Establecer el Título por defecto de la foto desde EXIF/Lightroom o nombre del archivo
      if (extractedTitle) {
        setNewPhotoTitle(extractedTitle);
      } else {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewPhotoTitle(cleanName);
      }

      if (extractedDesc) {
        setNewPhotoDesc(extractedDesc);
      }

      // 3. Comprimir y optimizar la imagen para prevenir límite de LocalStorage (5MB)
      const compressedUrl = await compressImage(file);
      setNewPhotoUrl(compressedUrl);

    } catch (err) {
      console.error("Error al procesar la imagen subida:", err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Portfolio details update handler
  const handleConfigChange = (key: keyof PortfolioConfig, value: string) => {
    onUpdateConfig({
      ...config,
      [key]: value
    });
  };

  // Add or Edit photo submit Handler
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) {
      alert("Por favor ingrese al menos el Título y proporcione una foto.");
      return;
    }

    if (editingPhotoId) {
      // Update existing photo
      const updatedPhotos = photos.map((p) => {
        if (p.id === editingPhotoId) {
          return {
            ...p,
            url: newPhotoUrl,
            title: newPhotoTitle,
            description: newPhotoDesc,
            category: newPhotoCategory,
            camera: newPhotoCamera,
            lens: newPhotoLens,
            settings: newPhotoSettings,
            editorialReview: newPhotoEditorial,
            suggestedSettings: newPhotoSuggested,
          };
        }
        return p;
      });
      onUpdatePhotos(updatedPhotos);
      resetForm();
    } else {
      // Create new photo
      const newPhoto: Photo = {
        id: "photo_" + Date.now(),
        url: newPhotoUrl,
        title: newPhotoTitle,
        description: newPhotoDesc,
        category: newPhotoCategory,
        date: new Date().toISOString().split("T")[0],
        camera: newPhotoCamera,
        lens: newPhotoLens,
        settings: newPhotoSettings,
        editorialReview: newPhotoEditorial,
        suggestedSettings: newPhotoSuggested,
      };

      onUpdatePhotos([newPhoto, ...photos]);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewPhotoUrl("");
    setNewPhotoTitle("");
    setNewPhotoDesc("");
    setNewPhotoCategory("Vida Silvestre | Wildlife");
    setNewPhotoCamera("Sony Alpha 7R V");
    setNewPhotoLens("FE 85mm f/1.4 GM");
    setNewPhotoSettings("f/1.8, 1/250s, ISO 100");
    setNewPhotoEditorial("");
    setNewPhotoSuggested("");
    setEditingPhotoId(null);
    setShowAddForm(false);
  };

  const handleDeletePhoto = (id: string) => {
    onUpdatePhotos(photos.filter(p => p.id !== id));
  };

  const copyClientLink = () => {
    navigator.clipboard.writeText(clientLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner introducing functionality */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-7 mb-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-stone-300 font-mono text-xs uppercase tracking-widest">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Panel de Control del Fotógrafo
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {config.title || "Tu Portafolio Creativo"}
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            Construye el portafolio de tu trabajo, añade sugerencias con Inteligencia Artificial, compártelo con tu cliente, y recopila su feedback en tiempo real.
          </p>
        </div>
        
        {/* Actions for Sharing */}
        <div className="z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto self-stretch md:self-auto shrink-0">
          <button
            onClick={copyClientLink}
            className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? "¡Copiado!" : "Copiar Enlace de Cliente"}
          </button>
          <button
            onClick={onSimulateClientView}
            style={{ backgroundColor: config.brandColor }}
            className="flex-1 sm:flex-initial text-white font-medium text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir Vista Cliente
          </button>
        </div>
      </div>

      {/* Main Grid: Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <div className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-1">Fotos en Portafolio</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-900">{photos.length}</span>
            <span className="text-xs text-stone-500">piezas</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <div className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-1">Revisiones de Clientes</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-stone-900">{reviews.length}</span>
            <span className="text-xs text-stone-500">sesiones</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <div className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-1">Aprobación de Fotos</div>
          <div className="flex items-baseline gap-2 col-span-1">
            <span className="text-3xl font-semibold text-stone-900">{approvalPercent}%</span>
            <span className="text-xs text-emerald-600 font-medium font-mono">+{approvedTotalCount} aprobadas</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-stone-400 font-mono text-xs uppercase tracking-wider">Accent Color</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-5 h-5 rounded-md border border-stone-300 block" style={{ backgroundColor: config.brandColor }} />
            <span className="text-xs font-mono font-bold uppercase text-stone-700">{config.brandColor}</span>
          </div>
        </div>
      </div>

      {/* Tab select bar */}
      <div className="border-b border-stone-200 mb-8 flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveTab("gallery"); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition ${
            activeTab === "gallery" 
              ? "border-stone-900 text-stone-900" 
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          🗃️ Galería & Fotos ({photos.length})
        </button>

        <button
          onClick={() => { setActiveTab("reviews"); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "reviews" 
              ? "border-stone-900 text-stone-900" 
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          📩 Feedback de Clientes ({reviews.length})
        </button>

        <button
          onClick={() => { setActiveTab("settings"); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "settings" 
              ? "border-stone-900 text-stone-900" 
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Ajustes de Perfil
        </button>
      </div>

      {/* GALLERY TAB */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-stone-50 p-4 border border-stone-200 rounded-xl">
            <div>
              <h2 className="font-sans font-medium text-stone-900">Configura tu Exposición</h2>
              <p className="text-xs sm:text-sm text-stone-500">Añade fotos nuevas de tus carpetas o selecciona nuestros enlaces sugeridos.</p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                style={{ backgroundColor: config.brandColor }}
                className="text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 hover:opacity-95 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Agregar Nueva Foto
              </button>
            )}
          </div>

          {/* Add Photo Form Panel */}
          {showAddForm && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3.5">
                <h3 className="font-sans font-medium text-stone-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-stone-700" /> {editingPhotoId ? "Editar Fotografía Cargada" : "Detallar Disparo"}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-stone-400 hover:text-stone-600 text-xs py-1 px-2.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>

              {/* Usability Drag and Drop Area for Photo Upload */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-2">
                  Subir Foto de tu Computadora o Dispositivo
                </label>
                
                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${
                    dragActive ? "border-stone-800 bg-stone-50" : "border-stone-200 hover:bg-stone-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {batchUploadStatus ? (
                    <div className="text-center text-stone-600 py-6 px-4 w-full max-w-sm mx-auto">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2.5 text-emerald-500 animate-spin" />
                      <p className="text-sm font-semibold text-stone-800">Cargando {batchUploadStatus.total} imágenes...</p>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Procesando {batchUploadStatus.current} de {batchUploadStatus.total}
                      </p>
                      <p className="text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-stone-400 mt-0.5 max-w-full">
                        {batchUploadStatus.fileName}
                      </p>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2.5 overflow-hidden border border-stone-200">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${(batchUploadStatus.current / batchUploadStatus.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : isProcessingImage ? (
                    <div className="text-center text-stone-500 py-6">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2.5 text-amber-500 animate-spin" />
                      <p className="text-sm font-semibold text-stone-800">Leyendo metadatos EXIF y optimizando para web...</p>
                      <p className="text-[11px] text-stone-400 mt-1 font-mono">Buscando marca, modelo de cámara, lente y parámetros de disparo...</p>
                    </div>
                  ) : newPhotoUrl ? (
                    <div className="text-center">
                      <img 
                        src={newPhotoUrl} 
                        alt="Preview" 
                        className="max-h-40 rounded-lg mx-auto mb-2.5 border border-stone-100 object-cover shadow-sm" 
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        type="button" 
                        onClick={() => setNewPhotoUrl("")}
                        className="text-xs text-red-600 hover:underline font-mono bg-red-50 py-1 px-3 rounded-lg"
                      >
                        Remover Foto
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-stone-500">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                      <p className="text-sm font-medium">Arrastra tu foto aquí o</p>
                      <button 
                        type="button" 
                        onClick={onButtonClick}
                        style={{ color: config.brandColor }}
                        className="text-xs font-semibold hover:underline mt-1 font-sans"
                      >
                        busca un archivo local
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-stone-500 font-sans px-1 leading-relaxed">
                  <span>📸 <strong>Formatos Soportados:</strong> .JPG, .JPEG, .PNG, .WebP con EXIF (Evita archivos RAW y Apple HEIC directamente).</span>
                  <span>⚙️ <strong>Optimización Automática:</strong> Redimensionamos y comprimimos tus fotos HD automáticamente a tamaños aptos de web (~150-250KB).</span>
                </div>
              </div>

              <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                {/* Standard Fallback Input URL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-100 pt-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                      O usar URL de web directa (Unsplash, etc.)
                    </label>
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                      Banco de Prueba rápido
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {sampleUnsplashPresets.map((pr) => (
                        <button
                          key={pr.label}
                          type="button"
                          onClick={() => {
                            setNewPhotoUrl(pr.url);
                            setNewPhotoCategory(pr.cat);
                            if(!newPhotoTitle) setNewPhotoTitle(pr.label);
                          }}
                          className="text-[10px] bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-800 px-1.5 py-1 rounded truncate transition"
                        >
                          + {pr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                      Título de la Foto *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      placeholder="Ej. Sombra de Otoño"
                      className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
                      Categorías / Colecciones (Selecciona una o más) *
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-stone-50 border border-stone-200 rounded-xl min-h-[105px] content-start">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const selectedCats = newPhotoCategory ? newPhotoCategory.split(", ") : [];
                        const isSelected = selectedCats.includes(opt.value);
                        
                        const handleToggleCategory = () => {
                          let updated = [...selectedCats];
                          if (isSelected) {
                            updated = updated.filter(c => c !== opt.value);
                          } else {
                            updated.push(opt.value);
                          }
                          // Keep at least one category to prevent empty state layout issues
                          if (updated.length === 0) {
                            updated = ["Otro | Other"];
                          }
                          setNewPhotoCategory(updated.join(", "));
                        };

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={handleToggleCategory}
                            style={{
                              borderColor: isSelected ? config.brandColor : "#e5e7eb",
                              backgroundColor: isSelected ? `${config.brandColor}15` : "#ffffff",
                              color: isSelected ? config.brandColor : "#57534e",
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border shadow-sm transition-all duration-200 active:scale-95 text-stone-700 hover:border-stone-450"
                          >
                            <span>{opt.label}</span>
                            {isSelected && <span className="font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                    Descripción / Pie de foto descriptivo
                  </label>
                  <textarea
                    value={newPhotoDesc}
                    onChange={(e) => setNewPhotoDesc(e.target.value)}
                    placeholder="Escribe algo sobre la atmósfera de la foto..."
                    rows={2}
                    className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-stone-400 text-stone-800"
                  />
                  <div className="mt-1 flex justify-between">
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-100 pt-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                      Cámara
                    </label>
                    <input
                      type="text"
                      value={newPhotoCamera}
                      onChange={(e) => setNewPhotoCamera(e.target.value)}
                      placeholder="Sony Alpha 7R V"
                      className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                      Lente Utilizado
                    </label>
                    <input
                      type="text"
                      value={newPhotoLens}
                      onChange={(e) => setNewPhotoLens(e.target.value)}
                      placeholder="FE 85mm f/1.4 GM"
                      className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1">
                      Parámetros Técnicos
                    </label>
                    <input
                      type="text"
                      value={newPhotoSettings}
                      onChange={(e) => setNewPhotoSettings(e.target.value)}
                      placeholder="f/1.8, 1/250s, ISO 100"
                      className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-800"
                    />
                  </div>
                </div>

                {newPhotoEditorial && (
                  <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-100 mt-4">
                    <h5 className="text-xs uppercase font-mono font-bold tracking-wider text-stone-500 mb-1">Análisis Curatorial cargado por IA</h5>
                    <p className="text-xs text-stone-600 leading-relaxed italic">"{newPhotoEditorial}"</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: config.brandColor }}
                    className="text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-95 transition shadow"
                  >
                    {editingPhotoId ? "Actualizar Fotografía" : "Guardar en Portafolio"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid of current photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow transition relative">
                
                {/* Photo Header Category badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1 max-w-[85%]">
                  {(photo.category || "Otro | Other").split(", ").map((cat, clickIdx) => {
                    const label = cat.split(" | ")[0] || cat;
                    return (
                      <span 
                        key={clickIdx}
                        className="bg-white/95 backdrop-blur-sm shadow-xs border border-stone-200/80 text-[9.5px] font-mono tracking-wider px-2 py-0.5 rounded uppercase font-semibold text-stone-700"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>

                <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 mb-4">
                    <h4 className="font-sans font-semibold text-stone-900 line-clamp-1">
                      {photo.title}
                    </h4>
                    <p className="text-xs text-stone-500 text-wrap line-clamp-2 leading-relaxed">
                      {photo.description || "Sin descripción cargada."}
                    </p>

                    {/* Camera Data */}
                    {(photo.camera || photo.lens) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[9.5px] font-mono bg-stone-100 px-1.5 py-0.5 text-stone-600 rounded">
                          📷 {photo.camera || "Cámara genérica"}
                        </span>
                        <span className="text-[9.5px] font-mono bg-stone-100 px-1.5 py-0.5 text-stone-600 rounded">
                          🔍 {photo.lens || "Objetivo genérico"}
                        </span>
                        {photo.settings && (
                          <span className="text-[9.5px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-semibold border border-amber-100/50">
                            ⚙️ {photo.settings}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs text-stone-400">
                    <span>{photo.date}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setNewPhotoUrl(photo.url);
                          setNewPhotoTitle(photo.title);
                          setNewPhotoDesc(photo.description);
                          setNewPhotoCategory(photo.category);
                          setNewPhotoCamera(photo.camera || "");
                          setNewPhotoLens(photo.lens || "");
                          setNewPhotoSettings(photo.settings || "");
                          setNewPhotoEditorial(photo.editorialReview || "");
                          setNewPhotoSuggested(photo.suggestedSettings || "");
                          setEditingPhotoId(photo.id);
                          setShowAddForm(true);
                          
                          // Smooth scroll back to the top of the gallery content where the form is shown
                          window.scrollTo({ top: 350, behavior: "smooth" });
                        }}
                        className="text-stone-500 hover:text-stone-800 hover:bg-stone-100 p-1.5 rounded-lg transition flex items-center justify-center"
                        title="Editar información de la foto"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                        title="Eliminar foto del portafolio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {photos.length === 0 && (
              <div className="col-span-full bg-stone-50 rounded-2xl py-12 px-4 border border-dashed border-stone-300 text-center text-stone-500">
                <ImageIcon className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="font-medium text-stone-800">Tu portafolio está vacío</p>
                <p className="text-xs mt-1">Crea tu primera entrada para enviarla al cliente.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{ backgroundColor: config.brandColor }}
                  className="mt-4 text-white text-xs px-4 py-2 rounded-lg font-medium"
                >
                  Subir Fotografía
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER REVIEWS TAB */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-stone-50 p-4 border border-stone-200 rounded-xl">
            <div>
              <h2 className="font-sans font-medium text-stone-900">Respuestas del Cliente</h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Cuando los clientes seleccionen fotos y dejen comentarios en la pestaña "Vista Cliente", verás sus decisiones reflejadas aquí al instante.
              </p>
            </div>
            {reviews.length > 0 && (
              <button
                onClick={onClearReviews}
                className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs px-3.5 py-2 rounded-xl transition font-medium"
              >
                Limpiar Historial
              </button>
            )}
          </div>

          <div className="space-y-6">
            {reviews.map((session) => {
              const approvedPhotos = session.feedbacks.filter(f => f.approved);
              const rejectedPhotos = session.feedbacks.filter(f => !f.approved);

              return (
                <div key={session.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="font-sans font-bold text-stone-900 text-base sm:text-lg">
                          {session.clientName}
                        </h4>
                      </div>
                      <div className="text-xs text-stone-400 mt-1 font-mono flex items-center gap-3">
                        <span>📧 {session.clientEmail}</span>
                        {session.companyName && <span>🏢 {session.companyName}</span>}
                        <span>📅 {new Date(session.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-150 inline-flex items-center gap-2">
                      <span className="text-xs text-stone-500">Aceptación:</span>
                      <span className="text-sm font-bold font-mono text-stone-800">
                        {approvedPhotos.length} / {session.feedbacks.length} Aprobadas
                      </span>
                    </div>
                  </div>

                  {/* General comment */}
                  {session.generalComment && (
                    <div className="bg-stone-50 p-4 border border-stone-150 rounded-xl italic">
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-500" /> Nota General del Cliente
                      </p>
                      <p className="text-sm text-stone-700 leading-relaxed font-sans">
                        "{session.generalComment}"
                      </p>
                    </div>
                  )}

                  {/* Detail list per-photo review and feedback cards */}
                  <div>
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-3 block">
                      Desglose por Disparo
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {session.feedbacks.map((f) => {
                        const originalPhoto = photos.find(p => p.id === f.photoId);
                        if (!originalPhoto) return null;

                        return (
                          <div key={f.photoId} className="flex gap-3 bg-stone-50/50 p-3 rounded-lg border border-stone-200/65">
                            <img
                              src={originalPhoto.url}
                              alt={originalPhoto.title}
                              className="w-16 h-16 object-cover rounded-md shrink-0 border border-stone-200"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <h6 className="text-xs font-semibold text-stone-900 truncate" title={originalPhoto.title}>
                                  {originalPhoto.title}
                                </h6>
                                <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                  f.approved 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                                    : "bg-red-50 text-red-700 border border-red-150"
                                }`}>
                                  {f.approved ? "Aprobada" : "Descartada"}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 leading-relaxed italic line-clamp-3">
                                {f.comment ? `"${f.comment}"` : "Sin comentarios individuales de edición."}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {reviews.length === 0 && (
              <div className="bg-stone-50 rounded-2xl py-12 px-4 border border-dashed border-stone-300 text-center text-stone-500">
                <FileText className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="font-medium text-stone-800">No hay feedback de clientes registrado aún</p>
                <p className="text-xs mt-1">Comparte tu portafolio presionando "Copiar Enlace de Cliente" en la cabecera.</p>
                <button
                  onClick={onSimulateClientView}
                  style={{ backgroundColor: config.brandColor }}
                  className="mt-4 text-white text-xs px-4 py-2 rounded-lg font-medium"
                >
                  Simular Comentarios de Cliente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS PORTFOLIO DESIGN TAB */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
          <div>
            <h2 className="font-sans font-medium text-stone-900 text-lg">Ajustes Estéticos de tu Exposición</h2>
            <p className="text-xs text-stone-500 mt-1">Configura cómo tus clientes miran tu marca personal y paleta de colores.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
                  Nombre Profesional / Estudio
                </label>
                <input
                  type="text"
                  value={config.photographerName}
                  onChange={(e) => handleConfigChange("photographerName", e.target.value)}
                  className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none "
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
                  Título de Encabezado
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => handleConfigChange("title", e.target.value)}
                  className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none "
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5">
                Sobre Mi / Biografía Curatorial
              </label>
              <textarea
                value={config.bio}
                onChange={(e) => handleConfigChange("bio", e.target.value)}
                rows={3}
                className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Correo de contacto
                </label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => handleConfigChange("email", e.target.value)}
                  className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2 outline-none "
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                  <Instagram className="w-3 h-3" /> Instagram
                </label>
                <input
                  type="text"
                  value={config.instagram}
                  onChange={(e) => handleConfigChange("instagram", e.target.value)}
                  className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2 outline-none "
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                  <Twitter className="w-3 h-3" /> Twitter
                </label>
                <input
                  type="text"
                  value={config.twitter}
                  onChange={(e) => handleConfigChange("twitter", e.target.value)}
                  className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2 outline-none "
                />
              </div>
            </div>

            {/* Accent presets palettes */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-2">
                Color de Acento de la Marca (Preselecciones)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Terracotta Rust", hex: "#7C2D12" },
                  { name: "Slate Charcoal", hex: "#1C1917" },
                  { name: "Deep Forest", hex: "#064E3B" },
                  { name: "Bordeaux Plum", hex: "#581C87" },
                  { name: "Linen Sand", hex: "#78716C" },
                  { name: "Warm Amber", hex: "#B45309" },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleConfigChange("brandColor", preset.hex)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border rounded-xl transition ${
                      config.brandColor === preset.hex 
                        ? "border-stone-900 bg-stone-200" 
                        : "border-stone-250 bg-white hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-stone-300 block" style={{ backgroundColor: preset.hex }} />
                    {preset.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-3">
                <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-400 mb-1.5">
                  O usar tu propio Código Hexadecimal (#HEX)
                </label>
                <input
                  type="text"
                  value={config.brandColor}
                  onChange={(e) => handleConfigChange("brandColor", e.target.value)}
                  placeholder="#7C2D12"
                  className="w-32 text-xs font-mono font-bold bg-white border border-stone-200 rounded-lg p-2 text-stone-800 focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* SEGURIDAD Y BACKUP LOCAL CARD */}
            <hr className="border-stone-200/80 my-6" />

            <div className="bg-stone-100/90 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-stone-200/80 rounded-xl text-stone-700">
                  <Database className="w-5 h-5 text-stone-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-semibold text-stone-800 flex items-center gap-2">
                    Centro de Salvaguarda & Copias de Seguridad de Fotos
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Evita perder tus imágenes y configuraciones. Tu navegador guarda los datos de forma local en una base de datos de alta capacidad (IndexedDB). Para total seguridad, descarga un respaldo físico que podrás restaurar en cualquier momento, reinstalación o dispositivo.
                  </p>
                </div>
              </div>

              {backupMessage && (
                <div 
                  className={`p-3.5 rounded-xl text-xs font-sans font-medium border leading-relaxed ${
                    backupMessage.type === "success" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                      : backupMessage.type === "error"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}
                >
                  {backupMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Export Backup button */}
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition-all active:scale-[0.98] duration-150"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Respaldo Completo (.json)</span>
                </button>

                {/* Import Backup button */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-[0.98] duration-150">
                  <Upload className="w-4 h-4 text-stone-400" />
                  <span>Restaurar Respaldo (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-white/95 border border-stone-200/50 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-2 justify-between items-center text-[11px] font-sans text-stone-500">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-stone-600">Almacenamiento Local Activo:</span>
                  <span>IndexedDB Encendido</span>
                </div>
                <div className="flex gap-3 font-mono font-medium">
                  <span>Fotos: {photos.length}</span>
                  <span>Feedback: {reviews.length}</span>
                </div>
              </div>
            </div>

            {/* CONFIGURACIÓN DE SEGURIDAD Y ACCESO ADMIN */}
            <hr className="border-stone-200/80 my-6" />

            <div className="bg-stone-100/90 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs text-left">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-stone-200/80 rounded-xl text-stone-700">
                  <Sliders className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-semibold text-stone-800 flex items-center gap-2">
                    🛡️ Configuración de Seguridad y Acceso (Google & Contraseña)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Protege tu panel administrativo cuando subes este proyecto a Vercel o GitHub. Configura tu contraseña administrativa y vincula tu cuenta de Google.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {/* Admin Password setting */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                    🔓 Contraseña de Acceso Directo (Panel)
                  </label>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => onUpdateAdminPassword?.(e.target.value)}
                    placeholder="Escribe la contraseña de acceso..."
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none font-sans"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Esta es la contraseña de respaldo para ingresar en cualquier dispositivo sin Google.
                  </p>
                </div>

                {/* Whitelisted emails setting */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                    ✉️ Correos de Google Whitelist (Separados por coma)
                  </label>
                  <input
                    type="text"
                    value={authorizedEmails.join(", ")}
                    onChange={(e) => {
                      const emails = e.target.value.split(",").map(email => email.trim());
                      onUpdateAuthorizedEmails?.(emails);
                    }}
                    placeholder="correo@gmail.com, ..."
                    className="w-full text-sm bg-white border border-stone-200 rounded-lg p-2.5 outline-none font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Solo los emails ingresados aquí podrán loguearse presionando "Entrar con Google". Tu email actual autorizado es: <span className="text-stone-700 font-bold bg-stone-200/60 px-1.5 py-0.5 rounded">{authorizedEmails[0]}</span>.
                  </p>
                </div>

                {/* Google Client ID setting */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-1.5 flex items-center gap-1">
                    ⚙️ Google OAuth Client ID (Para Vercel / Producción)
                  </label>
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => onUpdateGoogleClientId?.(e.target.value)}
                    placeholder="Ingresa tu Google Client ID de Google Cloud Console"
                    className="w-full text-[11px] font-mono bg-white border border-stone-200 rounded-lg p-2.5 outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Si dejas este campo con el predeterminado, se usará un Client ID genérico de pruebas. Para producción en Vercel, crea tus credenciales en el <strong>Google Cloud Console (OAuth 2.0 Client ID)</strong> para tu dominio de Vercel y pégalo aquí. ¡Listo!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
