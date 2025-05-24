// components/SessionExpiredModal.tsx
import React from "react";
import { useEffect } from "react";
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

const SessionExpiredModal = ({ onClose }: { onClose: () => void }) => {
  const calledRef = React.useRef(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
       if (!calledRef.current) {
        calledRef.current = true;
        onClose();
      }
    }, 6000); // se cierra en 6 segundos automáticamente

    return () => clearTimeout(timeout);
  }, [onClose]);

    const handleClose = () => {
    if (!calledRef.current) {
      calledRef.current = true;
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={handleClose} backdrop="blur" >
      <ModalContent className="text-white">
        <ModalHeader>Sesión Expirada</ModalHeader>
        <ModalBody>
          Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.
        </ModalBody>
        <ModalFooter>
          <Button onPress={handleClose} color="success" variant="bordered">Ir al login</Button>
        </ModalFooter>
      </ModalContent> 

    </Modal>
  
  );
};

export default SessionExpiredModal;
