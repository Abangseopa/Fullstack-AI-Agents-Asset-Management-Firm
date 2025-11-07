from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from main import app as _app

app = FastAPI(title="AI Asset Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Mount the main routes
app.mount("/", _app)
