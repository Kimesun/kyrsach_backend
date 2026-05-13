from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth_router, entries_router, tags_router, journals_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Online Diary API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(entries_router)
app.include_router(tags_router)
app.include_router(journals_router)

@app.get("/")
def root():
    return {"message": "Online Diary API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}