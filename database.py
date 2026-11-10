"""
Dependency Lab: Database Engine
SQLite-backed storage for anonymous behavioral research on AI dependency.
Complies with ethics requirements: no PII stored, random participant code,
full withdrawal capability, per-screen autosave.
"""

import sqlite3
import json
import os
import random
import string
from datetime import datetime
from typing import Dict, Any, List, Optional

if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/dependency_lab.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "dependency_lab.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Participants table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS participants (
        participant_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        consent_at TEXT,
        level TEXT,
        discipline TEXT,
        experience TEXT,
        tools TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT
    )
    """)
    
    # Responses table (one record per activity per participant, overwrites on re-submit)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS responses (
        participant_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        answer TEXT,
        explanation TEXT,
        confidence INTEGER,
        difficulty INTEGER,
        time_ms INTEGER DEFAULT 0,
        data_json TEXT,
        created_at TEXT NOT NULL,
        PRIMARY KEY (participant_id, activity_id),
        FOREIGN KEY (participant_id) REFERENCES participants (participant_id) ON DELETE CASCADE
    )
    """)

    # Qualitative Coding table (researcher tags applied to text responses)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS qualitative_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        theme_tag TEXT NOT NULL,
        notes TEXT,
        coded_at TEXT NOT NULL,
        FOREIGN KEY (participant_id) REFERENCES participants (participant_id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

def generate_participant_code() -> str:
    # Format: DL-XXXXXX (e.g. DL-4F9A2C)
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"DL-{suffix}"

def create_participant() -> str:
    code = generate_participant_code()
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "INSERT INTO participants (participant_id, created_at) VALUES (?, ?)",
        (code, now)
    )
    conn.commit()
    conn.close()
    return code

def record_consent(participant_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "UPDATE participants SET consent_at = ? WHERE participant_id = ?",
        (now, participant_id)
    )
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def update_profile(participant_id: str, level: str, discipline: str, experience: str, tools: List[str]) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    tools_str = json.dumps(tools) if isinstance(tools, list) else str(tools)
    cursor.execute(
        "UPDATE participants SET level = ?, discipline = ?, experience = ?, tools = ? WHERE participant_id = ?",
        (level, discipline, experience, tools_str, participant_id)
    )
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def save_response(
    participant_id: str,
    activity_id: str,
    answer: Optional[str] = None,
    explanation: Optional[str] = None,
    confidence: Optional[int] = None,
    difficulty: Optional[int] = None,
    time_ms: int = 0,
    data: Optional[Dict[str, Any]] = None
) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    data_json = json.dumps(data) if data is not None else None
    
    cursor.execute("""
    INSERT INTO responses (participant_id, activity_id, answer, explanation, confidence, difficulty, time_ms, data_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(participant_id, activity_id) DO UPDATE SET
        answer = excluded.answer,
        explanation = excluded.explanation,
        confidence = excluded.confidence,
        difficulty = excluded.difficulty,
        time_ms = excluded.time_ms,
        data_json = excluded.data_json,
        created_at = excluded.created_at
    """, (participant_id, activity_id, answer, explanation, confidence, difficulty, time_ms, data_json, now))
    
    conn.commit()
    conn.close()
    return True

def complete_participant(participant_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "UPDATE participants SET completed = 1, completed_at = ? WHERE participant_id = ?",
        (now, participant_id)
    )
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def withdraw_participant(participant_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM qualitative_codes WHERE participant_id = ?", (participant_id,))
    cursor.execute("DELETE FROM responses WHERE participant_id = ?", (participant_id,))
    cursor.execute("DELETE FROM participants WHERE participant_id = ?", (participant_id,))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def get_participant_state(participant_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM participants WHERE participant_id = ?", (participant_id,))
    p = cursor.fetchone()
    if not p:
        conn.close()
        return None
    
    cursor.execute("SELECT * FROM responses WHERE participant_id = ?", (participant_id,))
    responses = cursor.fetchall()
    conn.close()
    
    resp_map = {}
    for r in responses:
        resp_map[r["activity_id"]] = {
            "answer": r["answer"],
            "explanation": r["explanation"],
            "confidence": r["confidence"],
            "difficulty": r["difficulty"],
            "time_ms": r["time_ms"],
            "data": json.loads(r["data_json"]) if r["data_json"] else None,
            "created_at": r["created_at"]
        }
    
    return {
        "participant_id": p["participant_id"],
        "created_at": p["created_at"],
        "consent_at": p["consent_at"],
        "level": p["level"],
        "discipline": p["discipline"],
        "experience": p["experience"],
        "tools": json.loads(p["tools"]) if p["tools"] else [],
        "completed": bool(p["completed"]),
        "completed_at": p["completed_at"],
        "responses": resp_map
    }

def get_all_participants_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM participants ORDER BY created_at DESC")
    participants = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM responses ORDER BY participant_id, activity_id")
    responses = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM qualitative_codes ORDER BY coded_at DESC")
    codes = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    return participants, responses, codes

def add_theme_tag(participant_id: str, activity_id: str, theme_tag: str, notes: str = "") -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "INSERT INTO qualitative_codes (participant_id, activity_id, theme_tag, notes, coded_at) VALUES (?, ?, ?, ?, ?)",
        (participant_id, activity_id, theme_tag, notes, now)
    )
    conn.commit()
    conn.close()
    return True

def delete_theme_tag(code_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM qualitative_codes WHERE id = ?", (code_id,))
    conn.commit()
    conn.close()
    return True

