'use client';

import React, { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { UploadCloud } from "lucide-react";
import { uploadProducts } from "@/lib/api/products/products"; 

export default function ProductUpload({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor selecciona un archivo.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await uploadProducts(file);
      setMessage("Archivo importado con éxito");
      setFile(null);
      onSuccess();
    } catch (error: any) {
      setMessage(
        `Error: ${
          error.response?.data?.message || error.message || "Error inesperado"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={inputFileRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
      <div className="flex items-center gap-2">
        <Button
          onPress={handleFileSelect}
          variant="bordered"
          disabled={loading}
          color="success"
        >
          <UploadCloud className="w-4 h-4" />
          {file ? file.name : "Seleccionar archivo"}
        </Button>

        <Button
          onPress={handleUpload}
          disabled={loading || !file}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Subiendo..." : "Importar"}
        </Button>
      </div>
      {message && (
        <span
          className={`text-sm ${
            message.startsWith("Error") ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
