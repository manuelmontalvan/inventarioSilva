
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-12 flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Inventario Silva. Todos los derechos reservados.
            </p>
        </footer>
    );
};

export default Footer;