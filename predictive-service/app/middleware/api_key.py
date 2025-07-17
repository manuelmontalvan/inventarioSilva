from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            # IMPORTANTE: No respondas directamente ni pongas headers acá
            # Solo pasa adelante, CORSMiddleware ya maneja esto
            return await call_next(request)

        # Documentación pública
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        api_key = request.headers.get("X-API-Key")
        if api_key != API_KEY:
            raise HTTPException(status_code=401, detail="API key inválida o ausente")

        return await call_next(request)
