from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth, territories, places, stories, tripbooks, operators
import models.user, models.territory, models.place, models.operator
import models.story, models.tripbook, models.media, models.interaction

app = FastAPI(title="You The Trip — API", description="Piattaforma territoriale relazionale e narrativa", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000","http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
Base.metadata.create_all(bind=engine)
app.include_router(auth.router)
app.include_router(territories.router)
app.include_router(places.router)
app.include_router(stories.router)
app.include_router(tripbooks.router)
app.include_router(operators.router)

@app.get("/")
def root(): return {"message": "You The Trip API", "version": "0.1.0", "status": "running"}

@app.get("/health")
def health(): return {"status": "ok"}
