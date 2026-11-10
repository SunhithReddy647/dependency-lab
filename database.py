"""
Dependency Lab: Database Engine
Multi-tier storage supporting SQLite, PostgreSQL (Vercel Postgres, Supabase, Neon),
and Serverless Cloud Sync for anonymous behavioral research on AI dependency.
Complies with ethics requirements: no PII stored, random participant code,
full withdrawal capability, per-screen autosave.
"""

import sqlite3
import json
import os
import re
import random
import string
import urllib.request
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

POSTGRES_URL = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")
KV_REST_API_URL = os.environ.get("KV_REST_API_URL") or os.environ.get("UPSTASH_REDIS_REST_URL")
KV_REST_API_TOKEN = os.environ.get("KV_REST_API_TOKEN") or os.environ.get("UPSTASH_REDIS_REST_TOKEN")

if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/dependency_lab.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "dependency_lab.db")


class DictRow(dict):
    """Dictionary-like row for consistent access between SQLite and PostgreSQL."""
    def __getitem__(self, item):
        return super().get(item)


class PgCursorWrapper:
    def __init__(self, raw_cursor):
        self._cursor = raw_cursor
        self.rowcount = 0

    def execute(self, sql: str, params: Optional[Tuple] = None):
        # Convert SQLite '?' parameter placeholders to PostgreSQL '%s'
        pg_sql = re.sub(r'\?', '%s', sql)
        if params is not None:
            self._cursor.execute(pg_sql, params)
        else:
            self._cursor.execute(pg_sql)
        self.rowcount = self._cursor.rowcount
        return self

    def fetchone(self):
        row = self._cursor.fetchone()
        if not row:
            return None
        cols = [d[0] for d in self._cursor.description]
        return DictRow(dict(zip(cols, row)))

    def fetchall(self):
        rows = self._cursor.fetchall()
        if not rows:
            return []
        cols = [d[0] for d in self._cursor.description]
        return [DictRow(dict(zip(cols, r))) for r in rows]


class PgConnWrapper:
    def __init__(self, raw_conn):
        self._conn = raw_conn

    def cursor(self):
        return PgCursorWrapper(self._conn.cursor())

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


def get_postgres_connection():
    if not POSTGRES_URL:
        return None
    try:
        import pg8000.dbapi
        import ssl
        from urllib.parse import urlparse
        parsed = urlparse(POSTGRES_URL)
        ssl_ctx = ssl.create_default_context() if (parsed.hostname and parsed.hostname != "localhost") else None
        conn = pg8000.dbapi.connect(
            user=parsed.username or "postgres",
            password=parsed.password or "",
            host=parsed.hostname or "localhost",
            port=parsed.port or 5432,
            database=parsed.path.lstrip("/") or "postgres",
            ssl_context=ssl_ctx
        )
        return PgConnWrapper(conn)
    except Exception as e:
        print(f"Warning: PostgreSQL connection failed ({e}). Falling back to SQLite.")
        return None


def get_connection():
    if POSTGRES_URL:
        pg_conn = get_postgres_connection()
        if pg_conn:
            return pg_conn
            
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_active_storage_info() -> Dict[str, str]:
    if POSTGRES_URL:
        return {
            "engine": "PostgreSQL (Cloud Persistent)",
            "type": "cloud",
            "badge": "PostgreSQL Cloud DB"
        }
    elif KV_REST_API_URL and KV_REST_API_TOKEN:
        return {
            "engine": "Vercel KV / Upstash (Cloud Persistent)",
            "type": "cloud",
            "badge": "Vercel KV Cloud Store"
        }
    elif os.environ.get("VERCEL"):
        return {
            "engine": "SQLite 3 (Serverless + Browser Vault)",
            "type": "ephemeral",
            "badge": "Serverless + Browser Vault Synced"
        }
    else:
        return {
            "engine": "SQLite 3 (Local Persistent)",
            "type": "local",
            "badge": "Local SQLite Database"
        }


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Participants table (includes IP tracking for device session continuity)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS participants (
        participant_id TEXT PRIMARY KEY,
        ip_address TEXT,
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
    
    # Migrate existing database if column missing
    try:
        cursor.execute("ALTER TABLE participants ADD COLUMN ip_address TEXT")
    except Exception:
        pass
    
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
    if POSTGRES_URL:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS qualitative_codes (
            id SERIAL PRIMARY KEY,
            participant_id TEXT NOT NULL,
            activity_id TEXT NOT NULL,
            theme_tag TEXT NOT NULL,
            notes TEXT,
            coded_at TEXT NOT NULL,
            FOREIGN KEY (participant_id) REFERENCES participants (participant_id) ON DELETE CASCADE
        )
        """)
    else:
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


def create_participant(ip_address: Optional[str] = None) -> str:
    code = generate_participant_code()
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    cursor.execute(
        "INSERT INTO participants (participant_id, ip_address, created_at) VALUES (?, ?, ?)",
        (code, ip_address, now)
    )
    conn.commit()
    conn.close()
    return code


def get_active_participant_by_ip(ip_address: str) -> Optional[Dict[str, Any]]:
    if not ip_address:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT participant_id FROM participants WHERE ip_address = ? AND completed = 0 ORDER BY created_at DESC LIMIT 1",
        (ip_address,)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return get_participant_state(row["participant_id"])


def sync_or_restore_participant(
    participant_id: str,
    ip_address: Optional[str] = None,
    state_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Ensures participant exists even across serverless cold starts / container switches.
    Restores profile and responses if passed by client autosave.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM participants WHERE participant_id = ?", (participant_id,))
    row = cursor.fetchone()
    now = datetime.utcnow().isoformat() + "Z"
    
    if not row:
        cursor.execute(
            "INSERT INTO participants (participant_id, ip_address, created_at) VALUES (?, ?, ?)",
            (participant_id, ip_address, now)
        )
        conn.commit()
    elif ip_address and not row["ip_address"]:
        cursor.execute(
            "UPDATE participants SET ip_address = ? WHERE participant_id = ?",
            (ip_address, participant_id)
        )
        conn.commit()
        
    if state_data:
        profile = state_data.get("profile")
        if profile and isinstance(profile, dict):
            cursor.execute("""
                UPDATE participants 
                SET level = ?, discipline = ?, experience = ?, tools = ?
                WHERE participant_id = ?
            """, (
                profile.get("level"), profile.get("discipline"),
                profile.get("experience"), json.dumps(profile.get("tools", [])),
                participant_id
            ))
            conn.commit()
            
        responses = state_data.get("responses", {})
        if responses and isinstance(responses, dict):
            for act_id, resp in responses.items():
                if isinstance(resp, dict):
                    cursor.execute("""
                        INSERT INTO responses 
                        (participant_id, activity_id, answer, explanation, confidence, difficulty, time_ms, data_json, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(participant_id, activity_id) DO UPDATE SET
                            answer = excluded.answer,
                            explanation = excluded.explanation,
                            confidence = excluded.confidence,
                            difficulty = excluded.difficulty,
                            time_ms = excluded.time_ms,
                            data_json = excluded.data_json,
                            created_at = excluded.created_at
                    """, (
                        participant_id, act_id,
                        resp.get("answer"), resp.get("explanation"),
                        resp.get("confidence"), resp.get("difficulty"),
                        resp.get("time_ms", 0),
                        json.dumps(resp.get("data")) if resp.get("data") else None,
                        now
                    ))
            conn.commit()
            
    conn.close()
    return get_participant_state(participant_id)


def import_or_sync_submission(sub: Dict[str, Any]) -> bool:
    """
    Imports or merges a full participant submission record (from browser vault or backup JSON).
    """
    pid = sub.get("participant_id") or sub.get("participantId")
    if not pid:
        return False
        
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + "Z"
    created_at = sub.get("created_at") or sub.get("createdAt") or now
    is_completed = 1 if (sub.get("completed") or sub.get("isCompleted")) else 0
    consent_at = sub.get("consent_at") or (created_at if (sub.get("consented") or is_completed or sub.get("responses")) else created_at)
    completed_at = sub.get("completed_at") or (now if is_completed else None)
    
    profile = sub.get("profile") if isinstance(sub.get("profile"), dict) else {}
    level = profile.get("level") or sub.get("level")
    discipline = profile.get("discipline") or sub.get("discipline")
    experience = profile.get("experience") or sub.get("experience")
    tools = profile.get("tools") or sub.get("tools") or []
    tools_str = json.dumps(tools) if isinstance(tools, list) else str(tools)
    ip_addr = sub.get("ip_address") or sub.get("ip")
    
    # Upsert participant
    cursor.execute("""
        INSERT INTO participants (participant_id, ip_address, created_at, consent_at, level, discipline, experience, tools, completed, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(participant_id) DO UPDATE SET
            consent_at = COALESCE(excluded.consent_at, participants.consent_at),
            level = COALESCE(excluded.level, participants.level),
            discipline = COALESCE(excluded.discipline, participants.discipline),
            experience = COALESCE(excluded.experience, participants.experience),
            tools = COALESCE(excluded.tools, participants.tools),
            completed = MAX(excluded.completed, participants.completed),
            completed_at = COALESCE(excluded.completed_at, participants.completed_at)
    """, (pid, ip_addr, created_at, consent_at, level, discipline, experience, tools_str, is_completed, completed_at))
    
    # Upsert responses
    responses = sub.get("responses") if isinstance(sub.get("responses"), dict) else {}
    for act_id, resp in responses.items():
        if isinstance(resp, dict):
            ans = resp.get("answer")
            expl = resp.get("explanation")
            conf = resp.get("confidence")
            diff = resp.get("difficulty")
            t_ms = resp.get("time_ms", 0)
            data_val = resp.get("data")
            created = resp.get("created_at") or now
            data_json = json.dumps(data_val) if data_val is not None else None
            
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
            """, (pid, act_id, ans, expl, conf, diff, t_ms, data_json, created))
            
    conn.commit()
    conn.close()
    return True


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
