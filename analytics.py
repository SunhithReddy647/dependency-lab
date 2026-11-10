"""
Dependency Lab: Analytical Engine & Derived Measures
Aggregates participant responses for academic research on AI dependency:
- Perceived vs Behavioral dependency comparison
- Task outsourcing distributions
- Scenario decision profiles
- Content verification accuracy
- Independent thinking performance metrics
"""

import json
from typing import Dict, Any, List, Optional
import database
from database import get_connection

def compute_metrics(filter_level: str = None, filter_exp: str = None) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM participants WHERE consent_at IS NOT NULL OR completed = 1"
    params = []
    if filter_level and filter_level != "all":
        query += " AND level = ?"
        params.append(filter_level)
    if filter_exp and filter_exp != "all":
        query += " AND experience = ?"
        params.append(filter_exp)
        
    cursor.execute(query, params)
    participants = [dict(r) for r in cursor.fetchall()]
    p_ids = [p["participant_id"] for p in participants]
    
    if not p_ids:
        conn.close()
        return {
            "total_started": 0, "total_completed": 0, "completion_rate": 0,
            "levels_breakdown": {}, "perceived_vs_behavioral": [],
            "scenario_stats": {}, "flaw_stats": {}, "dependency_stats": {},
            "think_stats": {}, "reflection_stats": {},
            "storage_info": database.get_active_storage_info()
        }
    
    placeholders = ",".join("?" * len(p_ids))
    cursor.execute(f"SELECT * FROM responses WHERE participant_id IN ({placeholders})", p_ids)
    all_responses = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    p_resp_map: Dict[str, Dict[str, Any]] = {pid: {} for pid in p_ids}
    for r in all_responses:
        pid = r["participant_id"]
        act = r["activity_id"]
        r["parsed_data"] = json.loads(r["data_json"]) if r["data_json"] else {}
        p_resp_map[pid][act] = r

    total_started = len(participants)
    total_completed = sum(1 for p in participants if p["completed"] == 1)
    completion_rate = round((total_completed / total_started * 100) if total_started > 0 else 0, 1)

    levels_breakdown = {}
    for p in participants:
        lvl = p["level"] or "Unspecified"
        levels_breakdown[lvl] = levels_breakdown.get(lvl, 0) + 1

    # 1. Perceived vs Behavioral Matrix
    buckets = {1: [], 2: [], 3: [], 4: [], 5: []}
    
    for pid, resps in p_resp_map.items():
        # Check both new 'dependency_assessment' and legacy 'self_assessment'
        dep_resp = resps.get("dependency_assessment") or resps.get("self_assessment")
        if not dep_resp or not dep_resp.get("answer"):
            continue
        try:
            val = int(dep_resp["answer"])
            if val not in buckets: val = 3
        except (ValueError, TypeError):
            continue
        
        scen_tags = []
        for s_key in ["scenario_1", "scenario_2", "scenario_3", "scenario_4"]:
            s_resp = resps.get(s_key)
            if s_resp and s_resp.get("parsed_data") and "dependency_tag" in s_resp["parsed_data"]:
                scen_tags.append(s_resp["parsed_data"]["dependency_tag"])
        
        if scen_tags:
            b_index = sum(scen_tags) / len(scen_tags)
            buckets[val].append(b_index)

    perceived_vs_behavioral = []
    for rating in range(1, 6):
        vals = buckets[rating]
        n_count = len(vals)
        mean_b = round(sum(vals) / n_count, 2) if n_count > 0 else 0.0
        is_masked = 0 < n_count < 3
        perceived_vs_behavioral.append({
            "perceived_rating": rating,
            "label": f"Rating {rating}" + (" (High Autonomy)" if rating == 1 else " (High Dependency)" if rating == 5 else ""),
            "count": n_count,
            "mean_behavioral_index": mean_b if not is_masked else None,
            "masked": is_masked
        })

    # 2. Decision Scenarios Breakdown
    scenario_stats = {}
    scenario_titles = {
        "scenario_1": "Scenario 1: Identifying a Research Gap",
        "scenario_2": "Scenario 2: Verifying a 5-Paper AI Summary",
        "scenario_3": "Scenario 3: Convincing but Uncomprehended Text",
        "scenario_4": "Scenario 4: Research Assignment Without AI Access"
    }
    for s_key, s_title in scenario_titles.items():
        tag_counts = {0: 0, 1: 0, 2: 0, 3: 0}
        confidences = []
        answers_list = []
        for pid, resps in p_resp_map.items():
            sr = resps.get(s_key)
            if sr:
                tag = sr.get("parsed_data", {}).get("dependency_tag", 1)
                if tag in tag_counts: tag_counts[tag] += 1
                if sr.get("confidence"): confidences.append(sr["confidence"])
                if sr.get("answer"):
                    answers_list.append({"answer": sr["answer"], "why": sr.get("explanation")})
        
        total_ans = sum(tag_counts.values()) or 1
        scenario_stats[s_key] = {
            "title": s_title,
            "tag_counts": tag_counts,
            "total_answers": sum(tag_counts.values()),
            "mean_confidence": round(sum(confidences) / len(confidences), 2) if confidences else 0.0,
            "recent_reasons": answers_list[:4],
            "percentages": {
                "autonomous": round((tag_counts[0] / total_ans) * 100),
                "assisted": round((tag_counts[1] / total_ans) * 100),
                "verified": round((tag_counts[2] / total_ans) * 100),
                "relied": round((tag_counts[3] / total_ans) * 100)
            }
        }

    # 3. AI Content Verification Analysis
    verif_total = 0
    errors_caught_list = []
    reasoning_list = []
    verif_decisions = {}

    for pid, resps in p_resp_map.items():
        vr = resps.get("verification_activity") or resps.get("ai_eval")
        if vr:
            verif_total += 1
            pdata = vr.get("parsed_data", {})
            ticked = len(pdata.get("flagged_errors", pdata.get("flagged_flawed_indices", [])))
            errors_caught_list.append(ticked)
            dec = pdata.get("verify_decision", "Always verify before using")
            verif_decisions[dec] = verif_decisions.get(dec, 0) + 1
            if vr.get("explanation"):
                reasoning_list.append(vr["explanation"])

    flaw_stats = {
        "total_evaluations": verif_total,
        "mean_errors_caught": round(sum(errors_caught_list) / len(errors_caught_list), 2) if errors_caught_list else 0.0,
        "verification_decisions": verif_decisions,
        "recent_explanations": reasoning_list[:4]
    }

    # 4. Dependency Assessment Metrics
    freq_distribution = {}
    tasks_tally = {}
    reliance_ideas = []
    reliance_writing = []
    conf_without_ai = []

    for pid, resps in p_resp_map.items():
        da = resps.get("dependency_assessment") or resps.get("self_assessment")
        if da and da.get("parsed_data"):
            pd = da["parsed_data"]
            f = pd.get("frequency_usage", pd.get("frequency", "Daily / Multiple times a day"))
            freq_distribution[f] = freq_distribution.get(f, 0) + 1
            
            for t in pd.get("tasks_used", pd.get("A10_tasks", [])):
                tasks_tally[t] = tasks_tally.get(t, 0) + 1

            if "reliance_ideas" in pd: reliance_ideas.append(int(pd["reliance_ideas"]))
            if "reliance_writing" in pd: reliance_writing.append(int(pd["reliance_writing"]))
            if "confidence_without_ai" in pd: conf_without_ai.append(int(pd["confidence_without_ai"]))

    dependency_stats = {
        "frequency_distribution": freq_distribution,
        "tasks_outsourced": sorted([{"task": k, "count": v} for k, v in tasks_tally.items()], key=lambda x: x["count"], reverse=True),
        "mean_reliance_ideas": round(sum(reliance_ideas) / len(reliance_ideas), 2) if reliance_ideas else 0.0,
        "mean_reliance_writing": round(sum(reliance_writing) / len(reliance_writing), 2) if reliance_writing else 0.0,
        "mean_confidence_without_ai": round(sum(conf_without_ai) / len(conf_without_ai), 2) if conf_without_ai else 0.0
    }

    # 5. Independent Thinking Challenges Metrics
    think_tasks = ["think_task_a", "think_task_b", "think_task_c"]
    think_task_stats = {}
    for tk in think_tasks:
        lengths = []
        confs = []
        samples = []
        for pid, resps in p_resp_map.items():
            tr = resps.get(tk)
            if tr and tr.get("answer"):
                lengths.append(len(tr["answer"].split()))
                if tr.get("confidence"): confs.append(tr["confidence"])
                samples.append({"pid": pid, "answer": tr["answer"], "conf": tr.get("confidence")})
        think_task_stats[tk] = {
            "submissions": len(lengths),
            "avg_words": round(sum(lengths) / len(lengths), 1) if lengths else 0,
            "avg_confidence": round(sum(confs) / len(confs), 2) if confs else 0.0,
            "recent_samples": samples[:3]
        }

    # 6. Final Reflection Metrics
    refl_shifts = {"Yes": 0, "Partly": 0, "No": 0}
    refl_conf_change = {"Increased": 0, "Unchanged": 0, "Decreased": 0}
    hardest_tasks = []
    avoid_dependency_advice = []

    for pid, resps in p_resp_map.items():
        rf = resps.get("final_reflection") or resps.get("reflection")
        if rf and rf.get("parsed_data"):
            pd = rf["parsed_data"]
            s = pd.get("rely_more", "Partly")
            if s in refl_shifts: refl_shifts[s] += 1
            c = pd.get("conf_changed", "Unchanged")
            if c in refl_conf_change: refl_conf_change[c] += 1
            if pd.get("hardest_task"): hardest_tasks.append(pd["hardest_task"])
            if pd.get("avoid_advice"): avoid_dependency_advice.append(pd["avoid_advice"])

    reflection_stats = {
        "shift_distribution": refl_shifts,
        "confidence_change_distribution": refl_conf_change,
        "hardest_tasks_samples": hardest_tasks[:5],
        "avoid_dependency_advice": avoid_dependency_advice[:5]
    }

    return {
        "total_started": total_started,
        "total_completed": total_completed,
        "completion_rate": completion_rate,
        "levels_breakdown": levels_breakdown,
        "perceived_vs_behavioral": perceived_vs_behavioral,
        "scenario_stats": scenario_stats,
        "flaw_stats": flaw_stats,
        "dependency_stats": dependency_stats,
        "think_task_stats": think_task_stats,
        "reflection_stats": reflection_stats,
        "storage_info": database.get_active_storage_info()
    }
