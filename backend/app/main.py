import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from backend.app.database.session import engine, Base
from backend.app.api.public.router import router as public_router
from backend.app.api.owner.router import router as owner_router

load_dotenv()

# Ensure database tables exist (alongside Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Friendship Test API",
    description="Lightweight, cute, animated friendship quiz platform with private scoring",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(public_router)
app.include_router(owner_router)

# Health Check Endpoint (Section 39)
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Static Frontend SPA Serving (Section 38)
# Look for static dist folder: either in backend/app/static or frontend dist
STATIC_DIR = os.getenv("STATIC_DIR", os.path.join(os.path.dirname(__file__), "static"))
if not os.path.exists(STATIC_DIR):
    alt_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dist")
    if os.path.exists(alt_dist):
        STATIC_DIR = alt_dist

if os.path.exists(STATIC_DIR):
    # Mount assets subfolder if present
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # SPA Fallback for routes like /create, /dashboard, /test/{token}
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Do not catch /api routes
        if full_path.startswith("api/") or full_path == "health":
            return {"error": "Not found"}

        # If file directly exists in static dir, return it
        file_candidate = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_candidate):
            return FileResponse(file_candidate)

        # Fallback to index.html for SPA routing
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

        return {"error": "Static index file not found"}
