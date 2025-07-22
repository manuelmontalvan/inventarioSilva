::: mermaid
flowchart LR
Start([Inicio del sistema])

%% Autenticación  
 Start --> Login  
 Login -->Auth[Autenticación]  
 Auth --> ValidarCredenciales[Validar credenciales]
ValidarCredenciales --> GenerarToken[Generar JWT]
GenerarToken --> VerificarPermisos[Verificar rol y permisos]
VerificarPermisos--> Condicion{"VERIFICACION"}
Condicion--no--> Login
Condicion-- si -->Dashboard  
Dashboard -->Usuarios
Dashboard -->Productos
Dashboard -->Compras
Dashboard -->Ventas
Dashboard -->Configuracion
Dashboard --> Prediccion
Roles--Usuarios
Marcas-->Produtos
Categorias-->Productos
Unidades -->Productos
Localidades --> Productos
ProductStock-->Productos
Proveedores-->Compras
Clientes -->Ventas
Inventario -->Compras
Inventario -->Ventas
Margenes --> Configuracion
Paginas -->Configuracion




%% Login
subgraph Login [Login]
iniciar[Iniciar Sesion]
contraseña[Recuperar contrasña]
end

%% Usuarios
subgraph Usuarios [Gestión de Usuarios]
CrearUsuario
EditarUsuario
EliminarUsuario
ListarUsuarios
end

%% Roles
subgraph Roles [Gestión de Roles]
CrearRol
EditarRol
EliminarRol
AsignarPermisos
end

%% Productos
subgraph Productos [Gestión de Productos]
CrearProducto
EditarProducto
EliminarProducto
ListarProductos
end

%% Marcas
subgraph Marcas [Gestión de Marcas]
CrearMarca
EditarMarca
EliminarMarca
end

%% Categorías
subgraph Categorias [Gestión de Categorías]
CrearCategoria
EditarCategoria
EliminarCategoria
end

%% Unidades
subgraph Unidades [Gestión de Unidades de Medida]
CrearUnidad
EditarUnidad
EliminarUnidad
end

%% Localidades
subgraph Localidades [Gestión de Localidades]
CrearLocalidad
EditarLocalidad
EliminarLocalidad
end

%% ProductStock
subgraph ProductStock [Gestión de Stock de Productos]
VerStock[Ver stock por localidad]
ActualizarStockManual[Actualizar stock manual]
end

%% Proveedores
subgraph Proveedores [Gestión de Proveedores]
CrearProveedor
EditarProveedor
EliminarProveedor
ListarProveedores
end

%% Clientes
subgraph Clientes [Gestión de Clientes]
CrearCliente
EditarCliente
EliminarCliente
ListarClientes
end

%% Compras
subgraph Compras [Gestión de Compras]
NuevaCompra
NuevaCompra --> ActualizarStockCompra[Actualizar stock]
NuevaCompra --> GuardarHistorialCompra[Guardar historial]
VerCompras
end

%% Ventas
subgraph Ventas [Gestión de Ventas]
NuevaVenta
NuevaVenta --> GuardarHistorialVenta[Guardar historial]
VerVentas
end

%% Inventario
subgraph Inventario [Gestión de Inventario Entrada y Salida]
EntradaInventario[Registrar entrada]
EntradaInventario --> AumentarStock[Aumentar stock en ProductStock]
SalidaInventario[Registrar salida]
SalidaInventario --> DisminuirStock[Disminuir stock en ProductStock]
end

%% Márgenes
subgraph Margenes [Márgenes de Venta]
MargenGlobal[Definir margen global]
MargenGlobal --> RecalcularGlobal[Recalcular precios globales]
MargenCategoria[Definir margen por categoría]
MargenCategoria --> RecalcularPorCategoria[Recalcular precios por categoría]
end
%% Paginas
subgraph Paginas [Gestion Paginas]
Crear[Crear pagina ]
Editar[Editar Direccion]
Eliminar
end

%% Predicción
subgraph Prediccion [Predicción de Demanda]
ObtenerDatosVentas[Obtener historial de ventas]
ObtenerDatosVentas --> EntrenarModelo[Entrenar modelo Prophet]
EntrenarModelo --> MostrarPronostico[Mostrar pronóstico de demanda]
end
:::
