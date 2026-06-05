from datetime import date, timedelta


def build_demo_data():
    days = [date(2025, 5, 1) + timedelta(days=i) for i in range(31)]
    trend = []
    for i, day in enumerate(days):
        trend.append(
            {
                "date": day.strftime("%d %b"),
                "shipments": 980 + i * 18 + ((i % 6) * 44),
                "delays": 430 + i * 6 + ((i % 5) * 28),
                "returns": 120 + i * 3 + ((i % 4) * 18),
                "cost": 8200 + i * 455 + ((i % 5) * 970),
            }
        )

    carriers = [
        {"name": "DHL", "onTime": 92, "avgCost": 8.2, "issues": 86, "volume": 6420, "rating": 4.8},
        {"name": "UPS", "onTime": 89, "avgCost": 8.8, "issues": 102, "volume": 5080, "rating": 4.6},
        {"name": "GLS", "onTime": 76, "avgCost": 6.9, "issues": 242, "volume": 4170, "rating": 3.8},
        {"name": "FedEx", "onTime": 71, "avgCost": 10.4, "issues": 154, "volume": 2870, "rating": 3.9},
        {"name": "BRT", "onTime": 68, "avgCost": 7.1, "issues": 176, "volume": 3660, "rating": 3.6},
        {"name": "DPD", "onTime": 64, "avgCost": 7.7, "issues": 198, "volume": 3580, "rating": 3.5},
    ]

    shipments = [
        {"id": "SP-735624", "carrier": "DHL", "destination": "Germania", "status": "Consegnata", "date": "31 Mag 2025", "cost": 24.50, "risk": "Basso"},
        {"id": "SP-735623", "carrier": "UPS", "destination": "Francia", "status": "In ritardo", "date": "31 Mag 2025", "cost": 18.90, "risk": "Alto"},
        {"id": "SP-735622", "carrier": "GLS", "destination": "Italia", "status": "Consegnata", "date": "31 Mag 2025", "cost": 9.80, "risk": "Medio"},
        {"id": "SP-735621", "carrier": "BRT", "destination": "Spagna", "status": "In transito", "date": "31 Mag 2025", "cost": 15.40, "risk": "Medio"},
        {"id": "SP-735620", "carrier": "FedEx", "destination": "Regno Unito", "status": "Consegnata", "date": "30 Mag 2025", "cost": 21.30, "risk": "Basso"},
        {"id": "SP-735619", "carrier": "DPD", "destination": "Germania", "status": "A rischio", "date": "30 Mag 2025", "cost": 13.20, "risk": "Alto"},
    ]

    return {
        "kpis": [
            {"label": "Spedizioni Totali", "value": "24.786", "change": "+12.5%", "tone": "good"},
            {"label": "Consegne Riuscite", "value": "21.842", "change": "88.1%", "tone": "good"},
            {"label": "Consegne in Ritardo", "value": "1.842", "change": "7.4%", "tone": "bad"},
            {"label": "Resi", "value": "1.102", "change": "4.4%", "tone": "good"},
            {"label": "Costo Totale", "value": "EUR128.430", "change": "+8.2%", "tone": "warn"},
            {"label": "Risparmio Stimato", "value": "EUR18.760", "change": "Questo mese", "tone": "good"},
        ],
        "carriers": carriers,
        "countryDelays": [
            {"country": "Germania", "delays": 534, "growth": 34},
            {"country": "Francia", "delays": 412, "growth": 28},
            {"country": "Italia", "delays": 368, "growth": 15},
            {"country": "Spagna", "delays": 219, "growth": 9},
            {"country": "Regno Unito", "delays": 188, "growth": 7},
        ],
        "trend": trend,
        "alerts": [
            {"title": "Rischio ritardi in Francia", "priority": "Alta", "impact": "Aumento del 34% dei ritardi previsto per i prossimi 7 giorni.", "suggestion": "Bilanciare il volume su UPS e DPD per rotte FR-Nord."},
            {"title": "Aumento anomalie DHL", "priority": "Media", "impact": "Incremento del 22% delle anomalie negli ultimi 3 giorni.", "suggestion": "Rivedere pickup e SLA nei centri di smistamento tedeschi."},
            {"title": "Incremento resi in Italia", "priority": "Media", "impact": "Previsto aumento del 15% dei resi questa settimana.", "suggestion": "Isolare prodotti con danni ricorrenti e aggiornare packaging."},
        ],
        "shipments": shipments,
        "returns": [
            {"reason": "Prodotto danneggiato", "value": 28},
            {"reason": "Taglia errata", "value": 24},
            {"reason": "Non conforme", "value": 18},
            {"reason": "Ripensamento", "value": 16},
            {"reason": "Altro", "value": 14},
        ],
        "costOptimizer": {
            "identifiedSaving": 18760,
            "annualSaving": 64240,
            "recommendation": "Passando da GLS a DHL per spedizioni sotto i 2kg verso la Francia puoi risparmiare EUR6.240 al mese mantenendo SLA superiore.",
        },
        "assistantAnswer": {
            "analysis": "Il 73% dei ritardi in Germania e Francia e causato da saturazione GLS e aumento dei tempi medi nei centri di smistamento.",
            "data": ["Volume spedizioni +18%", "Tempo medio consegna da 2.1 a 4.3 giorni", "Customer satisfaction stimata -12%"],
            "action": "Distribuire il volume su DHL e DPD per le tratte ad alto rischio e monitorare le spedizioni premium ogni 6 ore.",
        },
    }
