"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { UploadCloud } from "lucide-react";
import { uploadProducts } from "@/lib/api/products/products";
type FileUploadProps = {
  uploadFunction: (file: File) => Promise<any>;
  onSuccess: () => void;
};
export default function FileUpload({ uploadFunction, onSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (message && messageType === "success") {
      const timeout = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000); // Oculta el mensaje después de 4 segundos
      return () => clearTimeout(timeout);
    }
  }, [message, messageType]);

  const handleFileSelect = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setMessage("");
      setMessageType("");
    }
  };

   const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor agrega un archivo antes de importar.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const data = await uploadFunction(file);
      setMessage("Archivo importado con éxito.");
      setMessageType("success");
      setFile(null);
      onSuccess();
    } catch (error: any) {
      setMessage(
        `Error: ${
          error.response?.data?.message || error.message || "Error inesperado"
        }`
      );
      setMessageType("error");
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
          disabled={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Subiendo..." : "Importar"}
        </Button>
      </div>

      {message && (
        <span
          className={`text-sm transition-all duration-300 ${
            messageType === "error" ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
