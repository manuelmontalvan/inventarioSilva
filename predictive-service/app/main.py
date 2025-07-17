from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = FastAPI()

# CORS middleware debe ir primero
origins = [
    "https://inventario-silva.vercel.app",  # Frontend en Vercel
    "http://localhost:3000",                  # Para desarrollo local (opcional)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para loguear peticiones
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print(f"[LOG] Incoming request: {request.method} {request.url}")
        response = await call_next(request)
        return response

app.add_middleware(LoggingMiddleware)

# Middleware para API Key (debe ir después de CORS)
class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Permitir OPTIONS para preflight sin validar API key
        if request.method == "OPTIONS":
            return await call_next(request)

        # Permitir docs y openapi sin API key
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        api_key = request.headers.get("X-API-Key")
        if api_key != API_KEY:
            raise HTTPException(status_code=401, detail="API key inválida o ausente")

        return await call_next(request)

app.add_middleware(APIKeyMiddleware)

@app.get("/")
async def root():
    print("Root endpoint was called")
    return {"message": "API de predicción funcionando"}

# Ejemplo de ruta para probar
@app.get("/predict/all-models")
async def predict_all_models(request: Request):
    print(f"Request received at /predict/all-models from {request.client.host}")
    return {"result": "ok"}
