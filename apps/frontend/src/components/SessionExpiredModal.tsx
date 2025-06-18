// components/SessionExpiredModal.tsx
import React, { useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SessionExpiredModal = ({ onClose }: Props) => {
  const calledRef = React.useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onClose();
      }
    }, 6000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  const handleClose = () => {
    if (!calledRef.current) {
      calledRef.current = true;
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={handleClose} backdrop="blur">
      <ModalContent className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-xl shadow-xl">
        <ModalHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
          Sesión Expirada
        </ModalHeader>
        <ModalBody className="text-sm">
          Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.
        </ModalBody>
        <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
          <Button
            onPress={handleClose}
            color="success"
            variant="bordered"
            className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-400"
          >
            Ir al login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SessionExpiredModal;
