from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # ✅ Maneja explícitamente preflight requests
        if request.method == "OPTIONS":
         response = Response(status_code=204)
         response.headers["Access-Control-Allow-Origin"] = "https://inventario-silva.vercel.app"
         response.headers["Access-Control-Allow-Credentials"] = "true"
         response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
         response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, X-API-Key"
         return response

        # ✅ Permite acceso a documentación pública
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        # 🔐 Verifica API Key en otros casos
        api_key = request.headers.get("X-API-Key")
        if api_key != API_KEY:
            raise HTTPException(status_code=401, detail="API key inválida o ausente")

        return await call_next(request)
