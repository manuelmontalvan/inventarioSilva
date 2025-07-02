"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { UploadCloud } from "lucide-react";

type FileUploadProps = {
  uploadFunction: (file: File) => Promise<void>; // Cambiado a void
  onSuccess: () => void;
};

export default function FileUpload({ uploadFunction, onSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

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
      await uploadFunction(file);
      setMessage("Archivo importado con éxito.");
      setMessageType("success");
      setFile(null);
      onSuccess();
    } catch (error: unknown) {
      let errorMessage = "Error inesperado";

      if (
        error &&
        typeof error === "object"
      ) {
        // intenta leer response.data.message
        if ("response" in error && error.response && typeof error.response === "object") {
          const response = error.response as { data?: { message?: string } };
          if (response.data?.message) {
            errorMessage = response.data.message;
          }
        } else if ("message" in error && typeof (error as { message: unknown }).message === "string") {
          errorMessage = (error as { message: string }).message;
        }
      }

      setMessage(`Error: ${errorMessage}`);
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
