"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Redirecting() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-lg"
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-medium"
        >
          Redirigiendo al login...
        </motion.p>
      </motion.div>
    </div>
  );
}
