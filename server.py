"""
Dependency Lab: FastAPI Application Server
Provides secure participant endpoints, per-screen autosave,
researcher analytics API, qualitative coding, and CSV/JSON export.
"""

import os
import io
import csv
import json
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query, Response, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel

import database
import analytics

# Initialize database
database.init_db()

app = FastAPI(
    title="Dependency Lab API",
    description="Empirical Research Platform on Generative AI Dependency & Intellectual Autonomy",
    version="1.0.0"
)

# Helper to reliably resolve client IP for session continuity
def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"

# Enable CORS for local development and embedded browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ConsentRequest(BaseModel):
    participant_id: str

class ProfileRequest(BaseModel):
    participant_id: str
    level: str
    discipline: str
    experience: str
    tools: List[str]

class SaveResponseRequest(BaseModel):
    participant_id: str
    activity_id: str
    answer: Optional[str] = None
    explanation: Optional[str] = None
    confidence: Optional[int] = None
    difficulty: Optional[int] = None
    time_ms: int = 0
    data: Optional[Dict[str, Any]] = None

class CompleteRequest(BaseModel):
    participant_id: str

class WithdrawRequest(BaseModel):
    participant_id: str

class SyncSessionRequest(BaseModel):
    participant_id: str
    current_step: Optional[int] = None
    profile: Optional[Dict[str, Any]] = None
    responses: Optional[Dict[str, Any]] = None
    completed: Optional[bool] = False

class ThemeTagRequest(BaseModel):
    participant_id: str
    activity_id: str
    theme_tag: str
    notes: Optional[str] = ""

# API Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Dependency Lab", "timestamp": datetime.utcnow().isoformat() + "Z"}

@app.post("/api/participant/start")
def start_session(request: Request):
    client_ip = get_client_ip(request)
    code = database.create_participant(ip_address=client_ip)
    return {"participant_id": code, "ip": client_ip, "status": "started"}

@app.get("/api/participant/resume-by-device")
def resume_by_device(request: Request):
    client_ip = get_client_ip(request)
    active = database.get_active_participant_by_ip(client_ip)
    if active:
        return {"found": True, "state": active, "ip": client_ip}
    return {"found": False, "ip": client_ip}

@app.post("/api/participant/sync-session")
def sync_session(req: SyncSessionRequest, request: Request):
    client_ip = get_client_ip(request)
    state = database.sync_or_restore_participant(
        participant_id=req.participant_id,
        ip_address=client_ip,
        state_data={"profile": req.profile, "responses": req.responses, "completed": req.completed}
    )
    return {"status": "synced", "state": state}

@app.post("/api/participant/consent")
def submit_consent(req: ConsentRequest):
    success = database.record_consent(req.participant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"status": "consented", "participant_id": req.participant_id}

@app.post("/api/participant/profile")
def submit_profile(req: ProfileRequest):
    success = database.update_profile(
        req.participant_id, req.level, req.discipline, req.experience, req.tools
    )
    if not success:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"status": "profile_updated", "participant_id": req.participant_id}

@app.post("/api/participant/save")
def save_activity_response(req: SaveResponseRequest):
    success = database.save_response(
        participant_id=req.participant_id,
        activity_id=req.activity_id,
        answer=req.answer,
        explanation=req.explanation,
        confidence=req.confidence,
        difficulty=req.difficulty,
        time_ms=req.time_ms,
        data=req.data
    )
    return {"status": "saved", "activity_id": req.activity_id}

@app.post("/api/participant/complete")
def complete_study(req: CompleteRequest):
    success = database.complete_participant(req.participant_id)
    return {"status": "completed", "participant_id": req.participant_id}

@app.get("/api/participant/state/{participant_id}")
def get_state(participant_id: str, request: Request):
    state = database.get_participant_state(participant_id)
    if not state:
        # Fallback to restore / ensure participant exists on serverless container switch
        client_ip = get_client_ip(request)
        state = database.sync_or_restore_participant(participant_id, ip_address=client_ip)
    return state

@app.post("/api/participant/withdraw")
def withdraw_data(req: WithdrawRequest):
    success = database.withdraw_participant(req.participant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"status": "withdrawn", "message": f"All data for {req.participant_id} permanently erased."}

# Admin & Analytics Endpoints
@app.get("/api/admin/metrics")
def get_admin_metrics(level: Optional[str] = None, experience: Optional[str] = None):
    return analytics.compute_metrics(filter_level=level, filter_exp=experience)

@app.get("/api/admin/participants")
def get_admin_participants():
    participants, responses, codes = database.get_all_participants_data()
    counts = {}
    last_activity = {}
    for r in responses:
        pid = r["participant_id"]
        counts[pid] = counts.get(pid, 0) + 1
        if pid not in last_activity or r["created_at"] > last_activity[pid]:
            last_activity[pid] = r["created_at"]
    
    enriched = []
    for p in participants:
        pid = p["participant_id"]
        enriched.append({
            "participant_id": pid,
            "level": p.get("level") or "Profile Pending",
            "discipline": p.get("discipline") or "Unspecified",
            "experience": p.get("experience") or "Unspecified",
            "completed": bool(p.get("completed")),
            "responses_count": counts.get(pid, 0),
            "created_at": p.get("created_at"),
            "completed_at": p.get("completed_at"),
            "last_activity": last_activity.get(pid) or p.get("created_at")
        })
    return {"total": len(enriched), "participants": enriched}

@app.get("/api/admin/responses")
def get_admin_responses(activity_id: Optional[str] = None, search: Optional[str] = None):
    participants, responses, codes = database.get_all_participants_data()
    
    # Map participants
    p_map = {p["participant_id"]: p for p in participants}
    
    # Map codes by (participant_id, activity_id)
    c_map = {}
    for c in codes:
        key = f"{c['participant_id']}_{c['activity_id']}"
        if key not in c_map:
            c_map[key] = []
        c_map[key].append(c)
        
    enriched = []
    for r in responses:
        if activity_id and activity_id != "all" and r["activity_id"] != activity_id:
            continue
        
        pid = r["participant_id"]
        p_info = p_map.get(pid, {})
        
        # Search filter
        if search:
            s_lower = search.lower()
            text_match = (
                (r["answer"] and s_lower in r["answer"].lower()) or
                (r["explanation"] and s_lower in r["explanation"].lower()) or
                (s_lower in pid.lower())
            )
            if not text_match:
                continue

        key = f"{pid}_{r['activity_id']}"
        assigned_codes = c_map.get(key, [])

        enriched.append({
            "participant_id": pid,
            "activity_id": r["activity_id"],
            "level": p_info.get("level", "Unknown"),
            "discipline": p_info.get("discipline", "Unknown"),
            "experience": p_info.get("experience", "Unknown"),
            "answer": r["answer"],
            "explanation": r["explanation"],
            "confidence": r["confidence"],
            "difficulty": r["difficulty"],
            "time_ms": r["time_ms"],
            "data": json.loads(r["data_json"]) if r["data_json"] else None,
            "created_at": r["created_at"],
            "codes": assigned_codes
        })
        
    return {"total": len(enriched), "responses": enriched}

@app.post("/api/admin/theme-tag")
def add_tag(req: ThemeTagRequest):
    success = database.add_theme_tag(req.participant_id, req.activity_id, req.theme_tag, req.notes or "")
    return {"status": "tagged"}

@app.delete("/api/admin/theme-tag/{code_id}")
def delete_tag(code_id: int):
    success = database.delete_theme_tag(code_id)
    return {"status": "deleted"}

@app.post("/api/admin/reset")
def reset_all_data():
    conn = database.get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM qualitative_codes")
    c.execute("DELETE FROM responses")
    c.execute("DELETE FROM participants")
    conn.commit()
    conn.close()
    return {"status": "reset", "message": "Database cleared."}

# Data Export Endpoints
@app.get("/api/export/csv")
def export_csv():
    participants, responses, codes = database.get_all_participants_data()
    p_map = {p["participant_id"]: p for p in participants}

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "participant_id", "academic_level", "discipline", "research_experience",
        "tools_used", "completed", "activity_id", "answer", "explanation",
        "confidence", "difficulty", "time_seconds", "created_at", "extra_json"
    ])
    
    for r in responses:
        pid = r["participant_id"]
        p = p_map.get(pid, {})
        tools = p.get("tools", "")
        time_s = round(r["time_ms"] / 1000, 1) if r["time_ms"] else 0
        writer.writerow([
            pid,
            p.get("level", ""),
            p.get("discipline", ""),
            p.get("experience", ""),
            tools,
            p.get("completed", 0),
            r["activity_id"],
            r["answer"] or "",
            r["explanation"] or "",
            r["confidence"] or "",
            r["difficulty"] or "",
            time_s,
            r["created_at"],
            r["data_json"] or ""
        ])
        
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=dependency_lab_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

@app.get("/api/export/json")
def export_json():
    participants, responses, codes = database.get_all_participants_data()
    return {
        "study": "Dependency Lab",
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "participants_count": len(participants),
        "responses_count": len(responses),
        "participants": participants,
        "responses": responses,
        "qualitative_codes": codes
    }

# Serve Static UI
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/admin")
def serve_admin():
    return FileResponse(os.path.join(STATIC_DIR, "admin.html"))

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    print("Dependency Lab starting on http://127.0.0.1:8000 (Pristine clean database ready for live participants)")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)

