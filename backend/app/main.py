from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel

from .demo_data import build_demo_data


SECRET_KEY = "demo-secret-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="ShippyPro AI Logistics Copilot API", version="1.0.0")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AssistantRequest(BaseModel):
    question: str


class Token(BaseModel):
    access_token: str
    token_type: str


def create_access_token(data: dict[str, Any]) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def current_user(token: str = Depends(oauth2_scheme)) -> dict[str, str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"email": email, "name": "Andrea B."}


@app.get("/health")
def health():
    return {"status": "ok", "service": "logistics-copilot"}


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != "andrea@shippypro.demo" or form_data.password != "demo123":
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return {"access_token": create_access_token({"sub": form_data.username}), "token_type": "bearer"}


@app.get("/api/overview")
def overview():
    return build_demo_data()


@app.get("/api/carriers")
def carriers():
    return build_demo_data()["carriers"]


@app.get("/api/alerts")
def alerts():
    return build_demo_data()["alerts"]


@app.get("/api/shipments")
def shipments():
    return build_demo_data()["shipments"]


@app.post("/api/assistant")
def assistant(request: AssistantRequest):
    answer = build_demo_data()["assistantAnswer"]
    return {
        "question": request.question,
        "analysis": answer["analysis"],
        "data": answer["data"],
        "action": answer["action"],
        "model": "demo-logistics-intelligence",
    }


@app.get("/api/reports")
def reports(user: dict[str, str] = Depends(current_user)):
    return {
        "owner": user["name"],
        "items": [
            {"name": "Executive Logistics Review", "period": "Maggio 2025", "format": "PDF", "status": "Pronto"},
            {"name": "Carrier SLA Benchmark", "period": "Q2 2025", "format": "CSV", "status": "Programmato"},
            {"name": "Returns Intelligence Export", "period": "Settimanale", "format": "Excel", "status": "Pronto"},
        ],
    }
