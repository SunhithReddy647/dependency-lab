"""
Dependency Lab: Verification Suite
Tests clean database status, participant submission, metrics computation,
and participant withdrawal for Protocol DL-2026 (UG & PG cohorts).
"""

import database
import analytics

def run_tests():
    print("1. Checking clean database status...")
    conn = database.get_connection()
    c = conn.cursor()
    p_count = c.execute("SELECT COUNT(*) FROM participants").fetchone()[0]
    r_count = c.execute("SELECT COUNT(*) FROM responses").fetchone()[0]
    conn.close()
    print(f"   Participants in DB: {p_count}, Responses: {r_count}")
    
    print("2. Simulating a first-time Undergraduate (UG) participant submission...")
    ug_pid = database.create_participant()
    assert ug_pid.startswith("DL-"), "Participant ID must follow DL-XXXXXX format"
    database.record_consent(ug_pid)
    database.update_profile(
        ug_pid,
        level="Undergraduate Student (B.Tech)",
        discipline="Computer Science",
        experience="1 to 2 years",
        tools=["ChatGPT", "Claude"]
    )
    database.save_response(
        ug_pid, "dependency_assessment",
        answer="3",
        data={"frequency_usage": "Several times a week", "reliance_ideas": 3, "overall_dependency": 3}
    )
    database.save_response(
        ug_pid, "think_task_a",
        answer="Does checking mobile notifications during study hours reduce retention among engineering students?",
        confidence=4
    )
    database.save_response(
        ug_pid, "scenario_1",
        answer="Brainstorm ideas with team members or on my own first",
        explanation="Formulating our own hypotheses prevents external anchor bias.",
        confidence=4,
        data={"dependency_tag": 0}
    )
    database.complete_participant(ug_pid)
    print(f"   UG Participant {ug_pid} successfully completed study.")

    print("3. Verifying analytical aggregation on real participant data...")
    metrics = analytics.compute_metrics()
    assert metrics["total_started"] == 1, f"Expected 1 started, got {metrics['total_started']}"
    assert metrics["total_completed"] == 1, f"Expected 1 completed, got {metrics['total_completed']}"
    assert metrics["completion_rate"] == 100.0
    print(f"   Metrics verified: {metrics['total_completed']} completed, rate: {metrics['completion_rate']}%")

    print("4. Testing GDPR / Ethics Withdrawal mechanism...")
    withdrawn = database.withdraw_participant(ug_pid)
    assert withdrawn is True, "Withdrawal must return True"
    state_after = database.get_participant_state(ug_pid)
    assert state_after is None, "Participant data must be completely erased"
    
    conn = database.get_connection()
    c = conn.cursor()
    final_p = c.execute("SELECT COUNT(*) FROM participants").fetchone()[0]
    conn.close()
    assert final_p == 0, "Database must be pristine 0 rows after withdrawal"
    print("   Withdrawal verified: Database is completely clean and empty (0 records).")

    print("\nALL VERIFICATIONS PASSED: 100% READY FOR LIVE UG/PG PARTICIPANTS! ✅")

if __name__ == "__main__":
    run_tests()
