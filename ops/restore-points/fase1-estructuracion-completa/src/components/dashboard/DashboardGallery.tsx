import React, { useState, useRef } from "react";
import { 
  Camera, 
  Trash2, 
  Sliders, 
  PlusCircle, 
  Image as ImageIcon,
  Upload,
  Pencil,
  RefreshCw
} from "lucide-react";
import { Photo, PortfolioConfig } from "../../types";
import { getLocalizedText } from "../../defaultData";
import { compressImage, extractExifMetadata } from "../../utils/image";

interface DashboardGalleryProps {
  photos: Photo[];
  onUpdatePhotos: (photos: Photo[]) => void;
  config: PortfolioConfig;
}

export default function DashboardGallery({
  photos,
  onUpdatePhotos,
  config,
}: DashboardGalleryProps) {
  // Photo Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoDesc, setNewPhotoDesc] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState(() => config.categories?.[0] || "Vida Silvestre | Wildlife");
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
      await handleFile(validFiles[0]);
    } else {
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
          const meta = await extractExifMetadata(file);
          const compressedUrl = await compressImage(file);
          const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

          const newPhoto: Photo = {
            id: `photo_${Date.now()}_batch_${i}_${Math.random().toString(36).substr(2, 5)}`,
            url: compressedUrl,
            title: meta.title || cleanName,
            description: meta.description,
            category: newPhotoCategory,
            date: new Date().toISOString().split("T")[0],
            camera: meta.camera,
            lens: meta.lens,
            settings: meta.settings,
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
      const meta = await extractExifMetadata(file);
      setNewPhotoCamera(meta.camera);
      setNewPhotoLens(meta.lens);
      setNewPhotoSettings(meta.settings);

      if (meta.title) {
        setNewPhotoTitle(meta.title);
      } else {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewPhotoTitle(cleanName);
      }

      if (meta.description) {
        setNewPhotoDesc(meta.description);
      }

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

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) {
      alert("Por favor ingrese al menos el Título y proporcione una foto.");
      return;
    }

    if (editingPhotoId) {
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
    setNewPhotoCategory(config.categories?.[0] || "Vida Silvestre | Wildlife");
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

  return (
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
            className="text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 hover:opacity-95 transition shadow-sm cursor-pointer"
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
                <div className="text-center text-stone-605 py-6 px-4 w-full max-w-sm mx-auto">
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
                  <p className="text-sm font-semibold text-stone-850">Leyendo metadatos EXIF y optimizando para web...</p>
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
                    className="text-xs text-red-650 hover:underline font-mono bg-red-50 py-1 px-3 rounded-lg cursor-pointer"
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
                    className="text-xs font-semibold hover:underline mt-1 font-sans cursor-pointer"
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
                      className="text-[10px] bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-800 px-1.5 py-1 rounded truncate transition cursor-pointer"
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
                  {(config.categories || []).map((cat) => {
                    const selectedCats = newPhotoCategory ? newPhotoCategory.split(", ") : [];
                    const isSelected = selectedCats.includes(cat);
                    
                    const handleToggleCategory = () => {
                      let updated = [...selectedCats];
                      if (isSelected) {
                        updated = updated.filter(c => c !== cat);
                      } else {
                        updated.push(cat);
                      }
                      if (updated.length === 0) {
                        updated = [config.categories?.[0] || "Otro | Other"];
                      }
                      setNewPhotoCategory(updated.join(", "));
                    };

                    const parts = cat.split(" | ");
                    const label = parts.length > 1 ? `${parts[0]} / ${parts[1]}` : cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={handleToggleCategory}
                        style={{
                          borderColor: isSelected ? config.brandColor : "#e5e7eb",
                          backgroundColor: isSelected ? `${config.brandColor}15` : "#ffffff",
                          color: isSelected ? config.brandColor : "#57534e",
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border shadow-sm transition-all duration-200 active:scale-95 text-stone-755 hover:border-stone-450"
                      >
                        <span>{label}</span>
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

            <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ backgroundColor: config.brandColor }}
                className="px-5 py-2.5 text-white text-xs font-semibold rounded-lg hover:opacity-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                {editingPhotoId ? "Guardar Cambios" : "Agregar a Galería"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid displays current photos in portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden group">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded uppercase font-bold">
                {photo.category ? photo.category.split(", ").map((c) => getLocalizedText(c, "es")).join(" / ") : "Sin Categoría"}
              </span>

              {/* Photo Admin Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setEditingPhotoId(photo.id);
                    setNewPhotoUrl(photo.url);
                    setNewPhotoTitle(photo.title);
                    setNewPhotoDesc(photo.description || "");
                    setNewPhotoCategory(photo.category || config.categories?.[0] || "");
                    setNewPhotoCamera(photo.camera || "");
                    setNewPhotoLens(photo.lens || "");
                    setNewPhotoSettings(photo.settings || "");
                    setNewPhotoEditorial(photo.editorialReview || "");
                    setNewPhotoSuggested(photo.suggestedSettings || "");
                    setShowAddForm(true);
                  }}
                  className="bg-white hover:bg-stone-50 text-stone-850 p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Estás seguro de que deseas eliminar esta fotografía del portafolio?")) {
                      handleDeletePhoto(photo.id);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-sans font-semibold text-stone-900 text-sm truncate">{photo.title}</h4>
                <p className="text-xs text-stone-500 line-clamp-2 h-8 leading-relaxed font-light">{photo.description || "Sin descripción descriptiva en la ficha."}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-stone-100 text-[9.5px] font-mono text-stone-450 mt-4">
                {photo.camera && <span className="bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">📷 {photo.camera}</span>}
                {photo.settings && <span className="bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">⚙️ {photo.settings}</span>}
              </div>
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className="col-span-full bg-stone-50 border border-dashed border-stone-300 rounded-2xl py-16 text-center text-stone-400">
            <ImageIcon className="w-12 h-12 mx-auto text-stone-300 mb-2.5" />
            <p className="font-medium text-stone-800">Tu portafolio está vacío</p>
            <p className="text-xs mt-1">Sube tus fotos para comenzar a exhibir y recibir feedback.</p>
            <button
              onClick={() => setShowAddForm(true)}
              style={{ backgroundColor: config.brandColor }}
              className="mt-4 text-white text-xs px-4 py-2 rounded-lg font-medium cursor-pointer"
            >
              Cargar Primera Foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
