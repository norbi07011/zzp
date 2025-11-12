import React, { useState, useRef } from "react";
import {
  uploadPortfolioImage,
  deletePortfolioImage,
} from "../../services/cleaningCompanyService";

interface PortfolioUploadModalProps {
  companyId: string;
  currentImages: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newImages: string[]) => void;
}

/**
 * MODUŁ 7: Upload zdjęć do portfolio
 *
 * Funkcjonalność:
 * - Drag & drop + klik do wyboru plików
 * - Walidacja: max 5MB, tylko JPEG/PNG/WebP
 * - Preview zdjęć z możliwością usunięcia
 * - Upload do Supabase Storage bucket 'portfolio-images'
 * - Automatyczna aktualizacja cleaning_companies.portfolio_images
 */
const PortfolioUploadModal: React.FC<PortfolioUploadModalProps> = ({
  companyId,
  currentImages,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(currentImages);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Zamknij modal i zresetuj state
  const handleClose = () => {
    setError(null);
    setDragActive(false);
    onClose();
  };

  // Walidacja pliku
  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Nieprawidłowy format. Dozwolone: JPEG, PNG, WebP";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Plik zbyt duży. Maksymalny rozmiar: 5MB";
    }

    return null;
  };

  // Upload pojedynczego pliku
  const handleFileUpload = async (file: File) => {
    setError(null);

    // ✅ TASK #10: Check max limit (10 images)
    if (previewImages.length >= 10) {
      setError("Osiągnięto maksymalną liczbę zdjęć (10)");
      return;
    }

    // Walidacja
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      // Upload do Supabase Storage
      const imageUrl = await uploadPortfolioImage(companyId, file);

      // Dodaj do preview
      const updatedImages = [...previewImages, imageUrl];
      setPreviewImages(updatedImages);

      // Callback sukcesu
      onSuccess(updatedImages);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err instanceof Error ? err.message : "Błąd uploadu zdjęcia");
    } finally {
      setUploading(false);
    }
  };

  // Usuń zdjęcie
  const handleDelete = async (imageUrl: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zdjęcie?")) {
      return;
    }

    setDeleting(imageUrl);
    setError(null);

    try {
      await deletePortfolioImage(companyId, imageUrl);

      // Usuń z preview
      const updatedImages = previewImages.filter((url) => url !== imageUrl);
      setPreviewImages(updatedImages);

      // Callback sukcesu
      onSuccess(updatedImages);
    } catch (err) {
      console.error("Error deleting image:", err);
      setError(err instanceof Error ? err.message : "Błąd usuwania zdjęcia");
    } finally {
      setDeleting(null);
    }
  };

  // Obsługa wyboru plików
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            📸 Portfolio zdjęć
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">❌ {error}</p>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="text-6xl">📤</div>

              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Przeciągnij zdjęcie lub kliknij aby wybrać
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Maksymalny rozmiar: 5MB • Formaty: JPEG, PNG, WebP
                </p>
                {/* ✅ TASK #10: Show limit info */}
                <p className="text-sm text-blue-600 font-medium mt-1">
                  {previewImages.length} / 10 zdjęć w portfolio
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || previewImages.length >= 10}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                  uploading || previewImages.length >= 10
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {uploading
                  ? "⏳ Uploading..."
                  : previewImages.length >= 10
                  ? "✅ Limit osiągnięty"
                  : "📁 Wybierz plik"}
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {previewImages.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🖼️ Twoje zdjęcia ({previewImages.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    {/* Image */}
                    <img
                      src={imageUrl}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Delete Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(imageUrl)}
                        disabled={deleting === imageUrl}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded-lg font-bold ${
                          deleting === imageUrl
                            ? "bg-gray-300 text-gray-500"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {deleting === imageUrl ? "⏳ Usuwam..." : "🗑️ Usuń"}
                      </button>
                    </div>

                    {/* Deleting Spinner */}
                    {deleting === imageUrl && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="animate-spin text-4xl">⏳</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {previewImages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">Brak zdjęć w portfolio</p>
              <p className="text-sm mt-2">
                Dodaj pierwsze zdjęcie aby rozpocząć!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioUploadModal;
