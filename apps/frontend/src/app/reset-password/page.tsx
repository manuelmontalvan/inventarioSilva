import React, { Suspense } from "react";
import ResetPasswordForm from "@/components/resetPassword/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando formulario...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
