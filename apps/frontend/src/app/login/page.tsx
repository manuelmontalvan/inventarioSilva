// app/login/page.tsx
import React from 'react';
import LoginForm from '@/components/form/loginForm'; // Importa el componente LoginForm

const LoginPage = () => {
    const handleLogin = (email: string) => {
        // Aquí manejarías la lógica de inicio de sesión real, como enviar los datos a un servidor.
        console.log('Usuario autenticado con email:', email);
        alert(`¡Bienvenido! Usuario autenticado con email: ${email}`);
        //  Redirigir al usuario a la página principal u otra página después del inicio de sesión exitoso.
        //  ejemplo:  window.location.href = '/dashboard';
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4"
        >
            <LoginForm onLogin={handleLogin} />
        </div>
    );
};

export default LoginPage;
 