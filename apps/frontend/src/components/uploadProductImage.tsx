// UploadProductImage.tsx
import { useRef, useState } from 'react';
import axios from '@/lib/axiosInstance'; // tu instancia de Axios

export default function UploadProductImage({ productId }: { productId: string }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`/products/${productId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mostrar preview (opcional)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al subir imagen:', error);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {imagePreview && (
        <img src={imagePreview} alt="Vista previa" className="h-32 mt-2" />
      )}
    </div>
  );
}
