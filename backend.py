import json
import os
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import calendar

app = Flask(__name__)

DATA_FILE = 'data.json'

    # Create realistic sample data for June 2026 with total_points
def build_demo_data():
    default_data = {
        "alex": {
            "password": "123456",
            "monthly_target": 280.0,
            "total_points": 1250,
            "energy_records": []
        },
        "lisa": {
            "password": "abcdef",
            "monthly_target": 320.0,
            "total_points": 980,
            "energy_records": []
        },
        "tom": {
            "password": "111111",
            "monthly_target": 250.0,
            "total_points": 640,
            "energy_records": []
        },
        "sarah": {
            "password": "sarah123",
            "monthly_target": None,
            "total_points": 0,
            "energy_records": []
        },
        "mike": {
            "password": "mike456",
            "monthly_target": 270.0,
            "total_points": 870,
            "energy_records": []
        },
    }

    # Rules:
    # - No future dates
    # - Every applicable day has one record
    # - Weekdays and weekends differ slightly
    # - Small deterministic variation makes data look more realistic
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    def add_realistic_records(username, start_date, weekday_base, weekend_base, variation_pattern):
        """
        Add one energy record per day from start_date up to today.
        variation_pattern is a short list used cyclically for small daily variation.
        """
        current_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        i = 0

        while current_date <= today:
            weekday = current_date.weekday()  # 0=Mon, 6=Sun
            base = weekday_base if weekday < 5 else weekend_base
            variation = variation_pattern[i % len(variation_pattern)]
            energy = round(base + variation, 1)

            default_data[username]["energy_records"].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "energy": energy
            })

            current_date += timedelta(days=1)
            i += 1

    # alex: more than one month of records, lower usage, likely to earn points
    alex_start = today - timedelta(days=42)
    add_realistic_records(
        "alex",
        alex_start,
        weekday_base=7.7,
        weekend_base=6.9,
        variation_pattern=[0.2, -0.1, 0.3, -0.2, 0.1, -0.1, 0.2]
    )

    # lisa: more than one month of records, higher usage, likely to exceed target
    lisa_start = today - timedelta(days=39)
    add_realistic_records(
        "lisa",
        lisa_start,
        weekday_base=11.9,
        weekend_base=10.8,
        variation_pattern=[0.3, -0.1, 0.4, 0.0, 0.2, -0.2, 0.1]
    )

    # tom: newer user, less than 30 days, moderate usage
    tom_start = today - timedelta(days=12)
    add_realistic_records(
        "tom",
        tom_start,
        weekday_base=7.9,
        weekend_base=7.1,
        variation_pattern=[0.1, -0.2, 0.2, 0.0, -0.1, 0.1, 0.0]
    )

    # mike: medium-term user, closer to target than lisa, but not as low as alex
    mike_start = today - timedelta(days=24)
    add_realistic_records(
        "mike",
        mike_start,
        weekday_base=8.8,
        weekend_base=8.0,
        variation_pattern=[0.2, -0.1, 0.1, -0.2, 0.2, 0.0, -0.1]
    )

    # sarah: keep as new user with no target and no records
    # ===============================================================================

    save_data(default_data)
    return default_data


def save_data(data):
    """Save user data to data.json"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def load_data():
    """Load user data from data.json, create with sample data if file doesn't exist"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
            if isinstance(data, dict):
                return data
        except Exception as e:
            print(f"Failed to load data.json: {e}")
    default_data = build_demo_data()
    save_data(default_data)
    return default_data

def reset_demo_data():
    demo_data = build_demo_data()
    save_data(demo_data)
    return demo_data

@app.route("/")
def login_page():
    return render_template("login.html")


@app.route("/index")
def index():
    return render_template("index.html")


# ==================== New front-end page routing ====================
@app.route("/history")
def history():
    return render_template("history.html")


@app.route("/leaderboard")
def leaderboard():
    return render_template("leaderboard.html")


@app.route("/redeem")
def redeem():
    return render_template("redeem.html")
# ===========================================================


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "username and password are required"}), 400
    users = reset_demo_data()
    if username not in users:
        return jsonify({"message": "user not found"}), 404
    if users[username]["password"] != password:
        return jsonify({"message": "incorrect password"}), 401

    return jsonify({"message": "login successful"})


@app.route("/set-target", methods=["POST"])
def set_target():
    data = request.get_json()
    username = data.get("username")
    target = data.get("target")

    if not username or target is None:
        return jsonify({"message": "username and target are required"}), 400

    try:
        target = float(target)
    except:
        return jsonify({"message": "target must be a number"}), 400

    if target < 0:
        return jsonify({"message": "target cannot be negative"}), 400
    users = load_data()
    if username not in users:
        return jsonify({"message": "user not found"}), 404

    users[username]["monthly_target"] = target
    save_data(users)

    return jsonify({"message": "target set successfully", "target": target})


@app.route("/add-energy", methods=["POST"])
def add_energy():
    data = request.get_json()
    username = data.get("username")
    energy = data.get("energy")

    if not username or energy is None:
        return jsonify({"message": "username and energy are required"}), 400

    try:
        energy = float(energy)
    except:
        return jsonify({"message": "energy must be a number"}), 400

    if energy < 0:
        return jsonify({"message": "energy cannot be negative"}), 400
    users = load_data()
    if username not in users:
        return jsonify({"message": "user not found"}), 404

    today = datetime.now().strftime("%Y-%m-%d")
    records = users[username]["energy_records"]

    for r in records:
        if r["date"] == today:
            r["energy"] = energy
            save_data(users)
            return jsonify({"message": "today's record updated", "energy": energy})

    records.append({"date": today, "energy": energy})
    save_data(users)
    return jsonify({"message": "energy added", "energy": energy})


@app.route("/energy-summary", methods=["GET"])
def energy_summary():
    """GET /energy-summary - Returns both monthly points_earned and total_points"""
    username = request.args.get("username")
    users = load_data()
    if not username or username not in users:
        return jsonify({"message": "username required or not found"}), 400

    now = datetime.now()
    year, month = now.year, now.month
    month_str = f"{year}-{month:02d}"

    _, days_in_month = calendar.monthrange(year, month)
    days_passed = now.day

    target = users[username]["monthly_target"] or 0.0
    prorated_target = target * (days_passed / days_in_month) if days_in_month > 0 else 0.0

    records = users[username]["energy_records"]
    this_month = [r for r in records if r["date"].startswith(month_str)]
    total_energy = sum(r["energy"] for r in this_month)

    if len(this_month) == 0 or prorated_target <= 0:
        saved = 0.0
        save_percentage = 0.0
        points_earned = 0
    else:
        saved = prorated_target - total_energy
    if saved < 0:
        saved = 0.0
    save_percentage = (saved / prorated_target * 100) if prorated_target > 0 else 0.0

    if prorated_target <= 0:
        points_earned = 0
    elif total_energy > prorated_target:
        points_earned = 0
    elif save_percentage >= 30:
        points_earned = 120
    elif save_percentage >= 20:
        points_earned = 90
    elif save_percentage >= 10:
        points_earned = 60
    elif save_percentage >= 0:
        points_earned = 30
    else:
        points_earned = 0

    return jsonify({
        "total_energy_this_month": round(total_energy, 2),
        "points_earned": points_earned,
        "total_points": users[username].get("total_points", 0),
        "save_percentage": round(save_percentage, 1),
        "saved_energy": round(saved, 2),
        "prorated_target": round(prorated_target, 2),
        "monthly_target": users[username].get("monthly_target")
    })


@app.route("/weekly-summary", methods=["GET"])
def weekly_summary():
    username = request.args.get("username")
    users = load_data()
    if not username or username not in users:
        return jsonify({"message": "username required or not found"}), 400

    now = datetime.now()
    weekday = now.weekday()
    monday = now - timedelta(days=weekday)
    sunday = monday + timedelta(days=6)

    week_start_str = monday.strftime("%Y-%m-%d")
    week_end_str = sunday.strftime("%Y-%m-%d")

    days_passed = weekday + 1
    progress_percentage = round((days_passed / 7.0) * 100, 1)

    records = users[username]["energy_records"]
    this_week_records = [r for r in records if week_start_str <= r["date"] <= week_end_str]
    this_week_records.sort(key=lambda x: x["date"])

    total_energy = sum(r["energy"] for r in this_week_records)

    note = ""
    if this_week_records:
        first_recorded = min(r["date"] for r in this_week_records)
        if first_recorded > week_start_str:
            note = f"You started recording on {first_recorded}. This week only includes days with data."
    if days_passed < 7 and not note:
        note = f"This week is not complete yet ({days_passed} days passed so far)."

    if not note:
        note = "Complete week data."

    return jsonify({
        "total_energy_this_week": round(total_energy, 2),
        "progress_percentage": progress_percentage,
        "note": note
    })

@app.route("/user-data", methods=["GET"])
def user_data():
    username = request.args.get("username")
    users = load_data()

    if not username or username not in users:
        return jsonify({
            "success": False,
            "message": "user not found"
        }), 404

    records = users[username].get("energy_records", [])
    records = sorted(records, key=lambda x: x["date"])

    return jsonify({
        "success": True,
        "username": username,
        "monthly_target": users[username].get("monthly_target", 0),
        "total_points": users[username].get("total_points", 0),
        "records": records
    })

@app.route("/leaderboard-data", methods=["GET"])
def leaderboard_data():
    users = load_data()
    leaderboard = []

    for username, user in users.items():
        total_points = user.get("total_points", 0)
        records = user.get("energy_records", [])

        current_month = datetime.now().strftime("%Y-%m")
        monthly_energy = sum(
            r["energy"] for r in records
            if r["date"].startswith(current_month)
        )

        leaderboard.append({
            "username": username,
            "total_points": total_points,
            "monthly_energy": round(monthly_energy, 2)
        })

    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)

    for index, item in enumerate(leaderboard, start=1):
        item["rank"] = index

    return jsonify({
        "success": True,
        "leaderboard": leaderboard
    })

@app.route("/get-user-info", methods=["GET"])
def get_user_info():
    username = request.args.get("username")
    users = load_data()
    if not username or username not in users:
        return jsonify({"success": False, "message": "user not found"}), 404

    monthly_target = users[username]["monthly_target"]
    total_points = users[username].get("total_points", 0)

    return jsonify({
        "success": True,
        "username": username,
        "monthly_target": monthly_target,
        "total_points": total_points
    })


@app.route("/debug-data", methods=["GET"])
def debug_data():
    users = load_data()
    return jsonify({
        "status": "success",
        "data_file": DATA_FILE,
        "users": users
    })


if __name__ == "__main__":
    users = load_data()
    app.run(debug=True, port=5002)
