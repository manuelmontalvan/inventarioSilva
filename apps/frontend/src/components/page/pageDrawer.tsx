
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import { Page } from "@/types/page";



interface Props {
  isOpen: boolean;
  onClose(): void;
  initialData: Page|null;
  onSave(name:string, path:string):void;
}
export function PageDrawer({isOpen,onClose,initialData,onSave}:Props){
  const [name,setName] = useState("");
  const [path,setPath] = useState("");
  useEffect(()=>{
    if(initialData){
      setName(initialData.name);
      setPath(initialData.path);
    } else {
      setName(""); setPath("");
    }
  },[initialData,isOpen]);

  if(!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}/>
      <aside className="fixed right-0 top-0 w-full max-w-sm h-full bg-white dark:bg-gray-900 z-50 p-6 overflow-auto">
        <Button onPress={onClose} variant="bordered" color="default">× Cerrar</Button>
        <h2 className="text-xl font-bold mt-4">{initialData ? "Editar Página" : "Crear Página"}</h2>
        <input value={name} onChange={e=>setName(e.target.value)} className="mt-2 p-2 border rounded w-full" placeholder="Nombre de la página" />
        <input value={path} onChange={e=>setPath(e.target.value)} className="mt-4 p-2 border rounded w-full" placeholder="/ruta/de/pagina" />
        <Button className="mt-4" onPress={() => name.trim() && path.trim() && onSave(name.trim(), path.trim())} color="success" variant="bordered">Guardar</Button>
      </aside>
    </>
  );
}
