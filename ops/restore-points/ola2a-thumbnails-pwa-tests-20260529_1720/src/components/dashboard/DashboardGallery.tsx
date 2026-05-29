import React, { useState, useRef } from "react";
import { Camera, PlusCircle, Image as ImageIcon, Upload, RefreshCw } from "lucide-react";
import { Photo, PortfolioConfig } from "../../types";
import { compressImage, generateThumbnail, extractExifMetadata, getThumbnailUrl } from "../../utils/image";
import { savePhotoToSupabase, deletePhotoFromSupabase, checkDbConnection } from "../../utils/supabase";
import GalleryPhotoForm from "./GalleryPhotoForm";
import GalleryPhotoCard from "./GalleryPhotoCard";

interface DashboardGalleryProps { photos: Photo[]; onUpdatePhotos: (photos: Photo[]) => void; config: PortfolioConfig; onUpdateConfig: (config: PortfolioConfig) => void; }

export default function DashboardGallery({ photos, onUpdatePhotos, config, onUpdateConfig }: DashboardGalleryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoThumbnailUrl, setNewPhotoThumbnailUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoDesc, setNewPhotoDesc] = useState("");
  const [newPhotoDate, setNewPhotoDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newPhotoCategory, setNewPhotoCategory] = useState(() => config.categories?.[0] || "Vida Silvestre | Wildlife");
  const [newPhotoCamera, setNewPhotoCamera] = useState("Sony Alpha 7R V");
  const [newPhotoLens, setNewPhotoLens] = useState("FE 85mm f/1.4 GM");
  const [newPhotoSettings, setNewPhotoSettings] = useState("f/1.8, 1/250s, ISO 100");
  const [newPhotoEditorial, setNewPhotoEditorial] = useState("");
  const [newPhotoSuggested, setNewPhotoSuggested] = useState("");
  const [newPhotoStatus, setNewPhotoStatus] = useState<'published' | 'draft'>('published');
  const [newPhotoTranslations, setNewPhotoTranslations] = useState({ title_es: "", description_es: "", editorialReview_es: "", suggestedSettings_es: "" });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [batchUploadStatus, setBatchUploadStatus] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbStatus, setDbStatus] = useState<"checking" | "online" | "offline">("checking");

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const checkStatus = async () => { const isOnline = await checkDbConnection(); setDbStatus(isOnline ? "online" : "offline"); };
    checkStatus(); interval = setInterval(checkStatus, 30000); return () => clearInterval(interval);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) { alert("Por favor cargue imágenes válidas (.jpg, .png, .jpeg, .webp)"); return; }
    const unsupported = files.filter(f => { const fn = f.name.toLowerCase(); return fn.endsWith(".heic") || fn.endsWith(".heif") || f.type.includes("heic") || f.type.includes("heif") || fn.endsWith(".cr2") || fn.endsWith(".nef") || fn.endsWith(".arw") || fn.endsWith(".dng") || fn.endsWith(".raw"); });
    if (unsupported.length > 0) alert(`⚠️ Se detectaron ${unsupported.length} archivo(s) RAW/HEIC no soportados. Se omitirán.`);
    const validFiles = files.filter(f => !unsupported.includes(f));
    if (validFiles.length === 0) return;
    if (validFiles.length === 1) { await handleFile(validFiles[0]); return; }

    setIsProcessingImage(true);
    const newPhotosList: Photo[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setBatchUploadStatus({ current: i + 1, total: validFiles.length, fileName: file.name });
      try {
        const meta = await extractExifMetadata(file);
        const [compressedUrl, thumbUrl] = await Promise.all([compressImage(file), generateThumbnail(file)]);
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newPhoto: Photo = { id: `photo_${Date.now()}_batch_${i}_${Math.random().toString(36).substr(2, 5)}`, url: compressedUrl, thumbnail_url: thumbUrl, title: meta.title || cleanName, description: meta.description, category: newPhotoCategory, date: new Date().toISOString().split("T")[0], status: newPhotoStatus, camera: meta.camera || newPhotoCamera, lens: meta.lens || newPhotoLens, settings: meta.settings || newPhotoSettings, editorialReview: "", suggestedSettings: "" };
        await savePhotoToSupabase(newPhoto);
        newPhotosList.push(newPhoto);
      } catch (singleErr) { console.error("Error processing file", file.name, singleErr); }
    }
    if (newPhotosList.length > 0) { onUpdatePhotos([...newPhotosList, ...photos]); resetForm(); }
    setBatchUploadStatus(null); setIsProcessingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.length > 0) handleMultipleFiles(e.dataTransfer.files); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length > 0) handleMultipleFiles(e.target.files); };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("Por favor cargue una imagen válida (.jpg, .png, .jpeg, .webp)"); return; }
    const fn = file.name.toLowerCase();
    if (fn.endsWith(".heic") || fn.endsWith(".heif") || fn.endsWith(".cr2") || fn.endsWith(".nef") || fn.endsWith(".arw") || fn.endsWith(".dng") || fn.endsWith(".raw")) { alert("⚠️ Formatos RAW y HEIC no soportados. Convertí a JPG o PNG."); return; }
    setIsProcessingImage(true);
    try {
      const meta = await extractExifMetadata(file);
      setNewPhotoCamera(meta.camera); setNewPhotoLens(meta.lens); setNewPhotoSettings(meta.settings);
      setNewPhotoTitle(meta.title || file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      if (meta.description) setNewPhotoDesc(meta.description);
      const [compressedUrl, thumbUrl] = await Promise.all([compressImage(file), generateThumbnail(file)]);
      setNewPhotoUrl(compressedUrl);
      setNewPhotoThumbnailUrl(thumbUrl);
    } catch (err) { console.error("Error al procesar la imagen subida:", err); } finally { setIsProcessingImage(false); }
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) { alert("Por favor ingrese al menos el Título y proporcione una foto."); return; }
    const thumbUrl = newPhotoThumbnailUrl || getThumbnailUrl(newPhotoUrl);

    if (editingPhotoId) {
      const updatedPhoto: Photo = { id: editingPhotoId, url: newPhotoUrl, thumbnail_url: thumbUrl, title: newPhotoTitle, description: newPhotoDesc, category: newPhotoCategory, date: newPhotoDate, camera: newPhotoCamera, lens: newPhotoLens, settings: newPhotoSettings, editorialReview: newPhotoEditorial, suggestedSettings: newPhotoSuggested, status: newPhotoStatus, title_es: newPhotoTranslations.title_es, description_es: newPhotoTranslations.description_es, editorialReview_es: newPhotoTranslations.editorialReview_es, suggestedSettings_es: newPhotoTranslations.suggestedSettings_es, sortOrder: photos.find(p => p.id === editingPhotoId)?.sortOrder };
      const { error } = await savePhotoToSupabase(updatedPhoto);
      if (error) { console.error("Supabase Error:", error); alert(`Error al guardar: ${error.message}`); return; }
      onUpdatePhotos(photos.map(p => p.id === editingPhotoId ? updatedPhoto : p));
    } else {
      const newPhoto: Photo = { id: "photo_" + Date.now(), url: newPhotoUrl, thumbnail_url: thumbUrl, title: newPhotoTitle, description: newPhotoDesc, category: newPhotoCategory, date: newPhotoDate || new Date().toISOString().split("T")[0], camera: newPhotoCamera, lens: newPhotoLens, settings: newPhotoSettings, editorialReview: newPhotoEditorial, suggestedSettings: newPhotoSuggested, status: newPhotoStatus, title_es: newPhotoTranslations.title_es, description_es: newPhotoTranslations.description_es, editorialReview_es: newPhotoTranslations.editorialReview_es, suggestedSettings_es: newPhotoTranslations.suggestedSettings_es, sortOrder: photos.length };
      const { error } = await savePhotoToSupabase(newPhoto);
      if (error) { console.error("Supabase Error:", error); alert(`Error al guardar: ${error.message}`); return; }
      onUpdatePhotos([newPhoto, ...photos]);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewPhotoUrl(""); setNewPhotoThumbnailUrl(""); setNewPhotoTitle(""); setNewPhotoDesc("");
    setNewPhotoDate(new Date().toISOString().split("T")[0]);
    setNewPhotoCategory(config.categories?.[0] || "Vida Silvestre | Wildlife");
    setNewPhotoCamera("Sony Alpha 7R V"); setNewPhotoLens("FE 85mm f/1.4 GM"); setNewPhotoSettings("f/1.8, 1/250s, ISO 100");
    setNewPhotoEditorial(""); setNewPhotoSuggested(""); setNewPhotoStatus('published');
    setNewPhotoTranslations({ title_es: "", description_es: "", editorialReview_es: "", suggestedSettings_es: "" });
    setEditingPhotoId(null); setShowAddForm(false);
  };

  const handleDeletePhoto = async (id: string) => { await deletePhotoFromSupabase(id); onUpdatePhotos(photos.filter(p => p.id !== id)); };
  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedPhotoId(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDropPhoto = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPhotoId || draggedPhotoId === targetId) return;
    const oldI = photos.findIndex(p => p.id === draggedPhotoId), newI = photos.findIndex(p => p.id === targetId);
    if (oldI === -1 || newI === -1) return;
    const newPhotos = [...photos]; newPhotos.splice(newI, 0, newPhotos.splice(oldI, 1)[0]);
    const updated = newPhotos.map((p, i) => ({ ...p, sortOrder: i }));
    let hasError = false;
    for (const p of updated) { const { error } = await savePhotoToSupabase(p); if (error) hasError = true; }
    if (hasError) alert("Hubo un error al guardar el nuevo orden en la base de datos.");
    onUpdatePhotos(updated);
  };

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhotoId(photo.id); setNewPhotoUrl(photo.url); setNewPhotoThumbnailUrl(photo.thumbnail_url || "");
    setNewPhotoTitle(photo.title); setNewPhotoDesc(photo.description || "");
    setNewPhotoDate(photo.date || new Date().toISOString().split("T")[0]);
    setNewPhotoCategory(photo.category || config.categories?.[0] || "");
    setNewPhotoCamera(photo.camera || ""); setNewPhotoLens(photo.lens || ""); setNewPhotoSettings(photo.settings || "");
    setNewPhotoEditorial(photo.editorialReview || ""); setNewPhotoSuggested(photo.suggestedSettings || "");
    setNewPhotoStatus(photo.status || 'published');
    setNewPhotoTranslations({ title_es: photo.title_es || "", description_es: photo.description_es || "", editorialReview_es: photo.editorialReview_es || "", suggestedSettings_es: photo.suggestedSettings_es || "" });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-stone-50 p-4 border border-stone-200 rounded-xl">
        <div>
          <h2 className="font-sans font-medium text-stone-900">Configura tu Exposición</h2>
          <p className="text-xs sm:text-sm text-stone-500">Añade fotos nuevas de tus carpetas o selecciona nuestros enlaces sugeridos.</p>
        </div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} style={{ backgroundColor: config.brandColor }} className="text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 hover:opacity-95 transition shadow-sm cursor-pointer">
            <PlusCircle className="w-4 h-4" /> Agregar Nueva Foto
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3.5">
            <h3 className="font-sans font-medium text-stone-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-stone-700" /> {editingPhotoId ? "Editar Fotografía Cargada" : "Detallar Disparo"}
            </h3>
            <button type="button" onClick={resetForm} className="text-stone-400 hover:text-stone-600 text-xs py-1 px-2.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition">Cancelar</button>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-mono font-medium text-stone-500 mb-2">Subir Foto de tu Computadora o Dispositivo</label>
            <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${dragActive ? "border-stone-800 bg-stone-50" : "border-stone-200 hover:bg-stone-50/50"}`}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              {batchUploadStatus ? (
                <div className="text-center text-stone-605 py-6 px-4 w-full max-w-sm mx-auto">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2.5 text-emerald-500 animate-spin" />
                  <p className="text-sm font-semibold text-stone-800">Cargando {batchUploadStatus.total} imágenes...</p>
                  <p className="text-[11px] text-stone-500 mt-1">Procesando {batchUploadStatus.current} de {batchUploadStatus.total}</p>
                  <p className="text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-stone-400 mt-0.5 max-w-full">{batchUploadStatus.fileName}</p>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2.5 overflow-hidden border border-stone-200">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${(batchUploadStatus.current / batchUploadStatus.total) * 100}%` }} />
                  </div>
                </div>
              ) : isProcessingImage ? (
                <div className="text-center text-stone-500 py-6">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2.5 text-amber-500 animate-spin" />
                  <p className="text-sm font-semibold text-stone-850">Leyendo metadatos EXIF y generando thumbnail...</p>
                  <p className="text-[11px] text-stone-400 mt-1 font-mono">Optimizando para web...</p>
                </div>
              ) : newPhotoUrl ? (
                <div className="text-center">
                  <img src={newPhotoUrl} alt="Preview" className="max-h-40 rounded-lg mx-auto mb-2.5 border border-stone-100 object-cover shadow-sm" referrerPolicy="no-referrer" />
                  <button type="button" onClick={() => { setNewPhotoUrl(""); setNewPhotoThumbnailUrl(""); }} className="text-xs text-red-650 hover:underline font-mono bg-red-50 py-1 px-3 rounded-lg cursor-pointer">Remover Foto</button>
                </div>
              ) : (
                <div className="text-center text-stone-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                  <p className="text-sm font-medium">Arrastra tu foto aquí o</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ color: config.brandColor }} className="text-xs font-semibold hover:underline mt-1 font-sans cursor-pointer">busca un archivo local</button>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm uppercase tracking-widest font-mono font-medium text-stone-800">Inventario de Galería</h2>
                {dbStatus === "checking" && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-mono">Conectando...</span>}
                {dbStatus === "online" && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> DB Online</span>}
                {dbStatus === "offline" && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> DB ERROR</span>}
              </div>
              <button onClick={() => { resetForm(); setShowAddForm(!showAddForm); }} className="text-[11px] text-stone-500 underline decoration-stone-300">Cerrar Panel</button>
            </div>
          </div>

          <GalleryPhotoForm config={config} editingPhotoId={editingPhotoId} newPhotoUrl={newPhotoUrl} setNewPhotoUrl={setNewPhotoUrl} newPhotoTitle={newPhotoTitle} setNewPhotoTitle={setNewPhotoTitle} newPhotoDesc={newPhotoDesc} setNewPhotoDesc={setNewPhotoDesc} newPhotoDate={newPhotoDate} setNewPhotoDate={setNewPhotoDate} newPhotoCategory={newPhotoCategory} setNewPhotoCategory={setNewPhotoCategory} newPhotoCamera={newPhotoCamera} setNewPhotoCamera={setNewPhotoCamera} newPhotoLens={newPhotoLens} setNewPhotoLens={setNewPhotoLens} newPhotoSettings={newPhotoSettings} setNewPhotoSettings={setNewPhotoSettings} newPhotoEditorial={newPhotoEditorial} setNewPhotoEditorial={setNewPhotoEditorial} newPhotoSuggested={newPhotoSuggested} setNewPhotoSuggested={setNewPhotoSuggested} newPhotoStatus={newPhotoStatus} setNewPhotoStatus={setNewPhotoStatus} newPhotoTranslations={newPhotoTranslations} setNewPhotoTranslations={setNewPhotoTranslations} resetForm={resetForm} handleAddPhotoSubmit={handleAddPhotoSubmit} onUpdateConfig={onUpdateConfig} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <GalleryPhotoCard key={photo.id} photo={photo} config={config} onEdit={handleEditPhoto} onDelete={handleDeletePhoto} onDragStart={handleDragStart} onDrop={handleDropPhoto} />
        ))}
        {photos.length === 0 && (
          <div className="col-span-full bg-stone-50 border border-dashed border-stone-300 rounded-2xl py-16 text-center text-stone-400">
            <ImageIcon className="w-12 h-12 mx-auto text-stone-300 mb-2.5" />
            <p className="font-medium text-stone-800">Tu portafolio está vacío</p>
            <p className="text-xs mt-1">Sube tus fotos para comenzar a exhibir y recibir feedback.</p>
            <button onClick={() => setShowAddForm(true)} style={{ backgroundColor: config.brandColor }} className="mt-4 text-white text-xs px-4 py-2 rounded-lg font-medium cursor-pointer">Cargar Primera Foto</button>
          </div>
        )}
      </div>
    </div>
  );
}
