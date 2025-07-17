from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

class APIKeyMiddleware(BaseHTTPMiddleware):
       async def dispatch(self, request: Request, call_next):
        # Permitir preflight automáticamente (ya lo hace CORSMiddleware, pero igual se valida)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Permitir acceso a documentación
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        # Verificación de API Key
        api_key = request.headers.get("X-API-Key")
        if api_key != API_KEY:
            raise HTTPException(status_code=401, detail="API key inválida o ausente")

        return await call_next(request)
