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
    data = build_demo_data()
    answer = build_assistant_answer(request.question, data)
    return {
        "question": request.question,
        "analysis": answer["analysis"],
        "data": answer["data"],
        "action": answer["action"],
        "model": "demo-logistics-intelligence",
    }


def build_assistant_answer(question: str, data: dict[str, Any]) -> dict[str, Any]:
    lower_question = question.lower()
    carriers = data["carriers"]
    worst_carrier = sorted(carriers, key=lambda carrier: carrier["onTime"])[0]
    best_carrier = sorted(carriers, key=lambda carrier: carrier["onTime"], reverse=True)[0]
    reliable_carriers = [carrier for carrier in carriers if carrier["onTime"] >= 85]
    cheapest_reliable_carrier = sorted(reliable_carriers or carriers, key=lambda carrier: carrier["avgCost"])[0]
    riskiest_country = sorted(data["countryDelays"], key=lambda country: country["growth"], reverse=True)[0]
    delayed_shipments = [
        shipment
        for shipment in data["shipments"]
        if "ritardo" in shipment["status"].lower() or "rischio" in shipment["risk"].lower()
    ]

    if any(term in lower_question for term in ["guadagn", "profit", "margine", "rendendo", "migliori rotte", "miglior rotta"]):
        optimizer = data["costOptimizer"]
        return {
            "analysis": f"Stai guadagnando meglio dove il costo medio resta basso e la puntualita rimane alta. La combinazione piu forte e {cheapest_reliable_carrier['name']}: costo medio EUR{cheapest_reliable_carrier['avgCost']:.2f} e {cheapest_reliable_carrier['onTime']}% on time.",
            "data": [
                f"{cheapest_reliable_carrier['name']}: miglior equilibrio margine/SLA",
                f"Risparmio stimato mensile: EUR{optimizer['identifiedSaving']:,}".replace(",", "."),
                f"{best_carrier['name']}: performance piu alta con {best_carrier['onTime']}% on time",
            ],
            "action": f"Aumenta il volume sulle tratte dove {cheapest_reliable_carrier['name']} mantiene SLA alto e usa {best_carrier['name']} per clienti premium o ordini ad alto valore.",
        }

    if "corriere" in lower_question or "efficiente" in lower_question:
        return {
            "analysis": f"{best_carrier['name']} e il corriere piu efficiente nel periodo analizzato, con {best_carrier['onTime']}% di consegne puntuali e rating {best_carrier['rating']:.1f}.",
            "data": [
                f"{best_carrier['name']}: {best_carrier['onTime']}% on time",
                f"{worst_carrier['name']}: {worst_carrier['onTime']}% on time",
                f"Differenza operativa: {best_carrier['onTime'] - worst_carrier['onTime']} punti percentuali",
            ],
            "action": f"Mantieni {best_carrier['name']} sulle spedizioni premium e limita {worst_carrier['name']} alle rotte dove il costo e prioritario rispetto allo SLA.",
        }

    if any(term in lower_question for term in ["perd", "soldi", "costo", "costi", "risparm", "spreco", "pagando troppo"]):
        optimizer = data["costOptimizer"]
        return {
            "analysis": "La perdita principale nasce da tratte economiche con bassa puntualita, che generano rimborsi, ticket customer care e seconde consegne.",
            "data": [
                f"Risparmio potenziale identificato: EUR{optimizer['identifiedSaving']:,}".replace(",", "."),
                "Costo totale monitorato: EUR128.430",
                f"{worst_carrier['name']} ha solo {worst_carrier['onTime']}% on time",
            ],
            "action": optimizer["recommendation"],
        }

    if "rischio" in lower_question:
        return {
            "analysis": f"Ci sono {len(delayed_shipments)} spedizioni recenti con segnali di rischio o ritardo, concentrate soprattutto su {riskiest_country['country']}.",
            "data": [
                f"{riskiest_country['country']}: +{riskiest_country['growth']}% crescita ritardi",
                f"{len(delayed_shipments)} spedizioni nel registro con stato critico",
                f"{worst_carrier['name']} e il carrier con performance piu debole",
            ],
            "action": "Apri escalation preventiva sui clienti premium e rialloca le prossime spedizioni verso carrier con SLA piu stabile.",
        }

    return {
        "analysis": f"L'aumento dei ritardi e guidato da {riskiest_country['country']} e dal calo performance di {worst_carrier['name']}.",
        "data": [
            f"{riskiest_country['country']}: +{riskiest_country['growth']}% ritardi",
            f"{worst_carrier['name']}: {worst_carrier['onTime']}% consegne puntuali",
            f"Alert predittivi attivi: {len(data['alerts'])}",
        ],
        "action": f"Riduci temporaneamente il volume su {worst_carrier['name']}, monitora {riskiest_country['country']} ogni giorno e aggiorna le promesse di consegna sui checkout ad alto rischio.",
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
