import json
import os
import tempfile
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import calendar

app = Flask(__name__)

DATA_FILE = 'data.json'

def calculate_points_by_percentage(save_percentage):
    if save_percentage >= 30:
        return 120
    elif save_percentage >= 20:
        return 90
    elif save_percentage >= 10:
        return 60
    elif save_percentage > 0:
        return 30
    return 0

def get_cycle_end_date(cycle_start):
    year = cycle_start.year
    month = cycle_start.month

    if month == 12:
        next_year = year + 1
        next_month = 1
    else:
        next_year = year
        next_month = month + 1

    _, days_in_next_month = calendar.monthrange(next_year, next_month)
    next_same_day = min(cycle_start.day, days_in_next_month)

    next_cycle_start = cycle_start.replace(
        year=next_year,
        month=next_month,
        day=next_same_day
    )
    cycle_end = next_cycle_start - timedelta(days=1)
    return cycle_end

def auto_settle_demo_data(users):
    today = datetime.now().date()

    for username, user in users.items():
        target = user.get("monthly_target") or 0.0
        cycle_start_str = user.get("cycle_start_date")
        records = user.get("energy_records", [])

        if target <= 0 or not cycle_start_str:
            continue

        current_cycle_start = datetime.strptime(cycle_start_str, "%Y-%m-%d")
        while True:
            current_cycle_end = get_cycle_end_date(current_cycle_start).date()

            if today <= current_cycle_end:
                break

            cycle_start_str_fmt = current_cycle_start.strftime("%Y-%m-%d")
            cycle_end_str_fmt = current_cycle_end.strftime("%Y-%m-%d")

            cycle_records = [
                 r for r in records
                 if cycle_start_str_fmt <= r["date"] <= cycle_end_str_fmt
            ]

            total_energy = sum(r["energy"] for r in cycle_records)

            if not cycle_records:
                 settled_points = 0
            else:
                actual_save_percentage = ((target - total_energy) / target) * 100

                if actual_save_percentage < 0:
                    actual_save_percentage = 0.0

                settled_points = calculate_points_by_percentage(actual_save_percentage)

            user["total_points"] = user.get("total_points", 0) + settled_points
            user["current_points"] = user.get("current_points",user.get("total_points", 0) - settled_points) + settled_points
            next_cycle_start = current_cycle_end + timedelta(days=1)
            user["cycle_start_date"] = next_cycle_start.strftime("%Y-%m-%d")
            current_cycle_start = datetime.strptime(user["cycle_start_date"], "%Y-%m-%d")

    return users

def build_demo_data():
    default_data = {
        "alex": {
            "password": "123456",
            "monthly_target": 280.0,
            "total_points": 1250,
            "current_points": 1250,
            "cycle_start_date": "2026-03-18",
            "energy_records": [],
            "redemption_history": []
        },
        "lisa": {
            "password": "abcdef",
            "monthly_target": 320.0,
            "total_points": 980,
            "current_points": 980,
            "cycle_start_date": "2026-03-23",
            "energy_records": [],
            "redemption_history": []
        },
        "tom": {
            "password": "111111",
            "monthly_target": 250.0,
            "total_points": 640,
            "current_points": 640,
            "cycle_start_date": "2026-03-19",
            "energy_records": [],
            "redemption_history": []
        },
        "sarah": {
            "password": "sarah123",
            "monthly_target": None,
            "total_points": 0,
            "current_points": 0,
            "cycle_start_date": None,
            "energy_records": [],
            "redemption_history": []
        },
        "mike": {
            "password": "mike456",
            "monthly_target": 270.0,
            "total_points": 0,
            "current_points": 0,
            "cycle_start_date": "2026-04-05",
            "energy_records": [],
            "redemption_history": []
        },
    }

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

    # alex
    alex_start = datetime(2026, 3, 18)
    add_realistic_records(
        "alex",
        alex_start,
        weekday_base=7.7,
        weekend_base=6.9,
        variation_pattern=[0.2, -0.1, 0.3, -0.2, 0.1, -0.1, 0.2]
    )

    # lisa
    lisa_start = datetime(2026, 3, 23)
    add_realistic_records(
        "lisa",
        lisa_start,
        weekday_base=11.9,
        weekend_base=10.8,
        variation_pattern=[0.3, -0.1, 0.4, 0.0, 0.2, -0.2, 0.1]
    )

    # tom
    tom_start = datetime(2026, 3, 19)
    add_realistic_records(
        "tom",
        tom_start,
        weekday_base=7.9,
        weekend_base=7.1,
        variation_pattern=[0.1, -0.2, 0.2, 0.0, -0.1, 0.1, 0.0]
    )

    # mike
    mike_start = datetime(2026, 4, 5)
    add_realistic_records(
        "mike",
        mike_start,
        weekday_base=8.8,
        weekend_base=8.0,
        variation_pattern=[0.2, -0.1, 0.1, -0.2, 0.2, 0.0, -0.1]
    )

    # sarah: keep as new user with no target and no records
    # ===============================================================================

    return default_data


def save_data(data):
    """Save user data to data.json"""
    data_dir = os.path.dirname(os.path.abspath(DATA_FILE)) or "."
    temp_fd, temp_path = tempfile.mkstemp(dir=data_dir, suffix=".tmp")

    try:
        with os.fdopen(temp_fd, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        os.replace(temp_path, DATA_FILE)
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise

def load_data():
    """Load user data from data.json, create with sample data if file doesn't exist"""
    if os.path.exists(DATA_FILE) and os.path.getsize(DATA_FILE) > 0:
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if isinstance(data, dict):
                changed = False

                for username, user in data.items():
                    if "current_points" not in user:
                        user["current_points"] = user.get("total_points", 0)
                        changed = True

                    if "redemption_history" not in user:
                        user["redemption_history"] = []
                        changed = True

                if changed:
                    save_data(data)
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
    users = auto_settle_demo_data(users)
    save_data(users)
    if username not in users:
        return jsonify({"message": "user not found"}), 404
    if users[username]["password"] != password:
        return jsonify({"message": "incorrect password"}), 401

    return jsonify({"message": "login successful"})

@app.route("/logout", methods=["POST"])
def logout():
    reset_demo_data()
    return jsonify({
        "success": True,
        "message": "logout successful"
    })

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
    if not users[username].get("cycle_start_date"):
        users[username]["cycle_start_date"] = datetime.now().strftime("%Y-%m-%d")
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
    username = request.args.get("username")
    users = load_data()
    if not username or username not in users:
        return jsonify({"message": "username required or not found"}), 400

    now = datetime.now()
    user = users[username]
    target = user.get("monthly_target") or 0.0
    total_points = user.get("total_points", 0)
    current_points = user.get("current_points", total_points)
    cycle_start_str = user.get("cycle_start_date")
    records = user.get("energy_records", [])

    if not cycle_start_str:
        return jsonify({
            "total_energy_this_cycle": 0,
            "monthly_target": user.get("monthly_target"),
            "total_points": total_points,
            "current_points": current_points,
            "cycle_start_date": None,
            "cycle_end_date": None,
            "days_in_cycle": 0,
            "days_recorded": 0,
            "usage_progress": 0.0,
            "prediction_ready": False,
            "predicted_cycle_total": None,
            "predicted_save_percentage": None,
            "predicted_points": 0
        })

    cycle_start = datetime.strptime(cycle_start_str, "%Y-%m-%d")
    cycle_end = get_cycle_end_date(cycle_start)

    cycle_start_str_fmt = cycle_start.strftime("%Y-%m-%d")
    cycle_end_str_fmt = cycle_end.strftime("%Y-%m-%d")

    cycle_records = [
        r for r in records
        if cycle_start_str_fmt <= r["date"] <= cycle_end_str_fmt
    ]
    cycle_records.sort(key=lambda x: x["date"])

    total_energy = sum(r["energy"] for r in cycle_records)
    recorded_days = len(cycle_records)
    days_in_cycle = (cycle_end - cycle_start).days + 1

    if target > 0:
        usage_progress = (total_energy / target) * 100
        usage_progress = min(usage_progress, 100.0)
    else:
        usage_progress = 0.0

    prediction_ready = False
    predicted_cycle_total = None
    predicted_save_percentage = None
    predicted_points = 0

    if target > 0 and recorded_days >= 1 and now.date() <= cycle_end.date():
        prediction_ready = True
        avg_daily_energy = total_energy / recorded_days
        predicted_cycle_total = avg_daily_energy * days_in_cycle
        predicted_save_percentage = ((target - predicted_cycle_total) / target) * 100

        if predicted_save_percentage < 0:
            predicted_save_percentage = 0.0
        predicted_points = calculate_points_by_percentage(predicted_save_percentage)

    return jsonify({
        "total_energy_this_cycle": round(total_energy, 2),
        "monthly_target": user.get("monthly_target"),
        "total_points": total_points,
        "current_points": current_points,
        "cycle_start_date": cycle_start_str_fmt,
        "cycle_end_date": cycle_end_str_fmt,
        "days_in_cycle": days_in_cycle,
        "days_recorded": recorded_days,
        "usage_progress": round(usage_progress, 1),
        "prediction_ready": prediction_ready,
        "predicted_cycle_total": round(predicted_cycle_total, 2) if predicted_cycle_total is not None else None,
        "predicted_save_percentage": round(predicted_save_percentage, 1) if predicted_save_percentage is not None else None,
        "predicted_points": predicted_points
    })


@app.route("/weekly-summary", methods=["GET"])
def weekly_summary():
    username = request.args.get("username")
    users = load_data()
    if not username or username not in users:
        return jsonify({"message": "username required or not found"}), 400

    now = datetime.now().date()
    user = users[username]
    cycle_start_str = user.get("cycle_start_date")
    records = user.get("energy_records", [])

    if not cycle_start_str:
        return jsonify({
            "total_energy_this_week": 0,
            "progress_percentage": 0.0,
            "note": "No cycle has started yet."
        })

    cycle_start = datetime.strptime(cycle_start_str, "%Y-%m-%d").date()
    cycle_end = get_cycle_end_date(datetime.strptime(cycle_start_str, "%Y-%m-%d")).date()

    effective_today = min(now, cycle_end)

    first_week_end = min(
        cycle_start + timedelta(days=(6 - cycle_start.weekday())),
        cycle_end
    )

    if effective_today <= first_week_end:
        week_start = cycle_start
        week_end = first_week_end

    else:
        current_monday = effective_today - timedelta(days=effective_today.weekday())
        current_sunday = current_monday + timedelta(days=6)

        week_start = current_monday
        week_end = min(current_sunday, cycle_end)

    week_start_str = week_start.strftime("%Y-%m-%d")
    week_end_str = week_end.strftime("%Y-%m-%d")

    this_week_records = [r for r in records if week_start_str <= r["date"] <= week_end_str]
    this_week_records.sort(key=lambda x: x["date"])

    total_energy = sum(r["energy"] for r in this_week_records)

    days_in_week_period = (week_end - week_start).days + 1
    days_passed = (effective_today - week_start).days + 1

    progress_percentage = round((days_passed / days_in_week_period) * 100, 1)

    if days_passed < days_in_week_period:
        note = f"This week is not complete yet ({days_passed} days passed so far)."
    else:
        note = "Complete week data."

    return jsonify({
        "total_energy_this_week": round(total_energy, 2),
        "progress_percentage": progress_percentage,
        "note": note,
        "week_start_date": week_start_str,
        "week_end_date": week_end_str
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
        cycle_start_str = user.get("cycle_start_date")
        if cycle_start_str:
            cycle_start = datetime.strptime(cycle_start_str, "%Y-%m-%d")
            cycle_end = get_cycle_end_date(cycle_start)
            cycle_start_str_fmt = cycle_start.strftime("%Y-%m-%d")
            cycle_end_str_fmt = cycle_end.strftime("%Y-%m-%d")

            monthly_energy = sum(
                r["energy"] for r in records
                if cycle_start_str_fmt <= r["date"] <= cycle_end_str_fmt
            )
        else:
            monthly_energy = 0

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
    current_points = users[username].get("current_points", total_points)

    return jsonify({
        "success": True,
        "username": username,
        "monthly_target": monthly_target,
        "total_points": total_points,
        "current_points": current_points
    })

@app.route("/redeem-reward", methods=["POST"])
def redeem_reward():
    data = request.get_json()

    username = data.get("username")
    reward_name = data.get("reward_name")
    points_required = data.get("points_required")

    if not username or not reward_name or points_required is None:
        return jsonify({
            "success": False,
            "message": "username, reward_name and points_required are required"
        }), 400

    try:
        points_required = int(points_required)
    except Exception:
        return jsonify({
            "success": False,
            "message": "points_required must be a number"
        }), 400

    if points_required <= 0:
        return jsonify({
            "success": False,
            "message": "points_required must be greater than 0"
        }), 400

    users = load_data()

    if username not in users:
        return jsonify({
            "success": False,
            "message": "user not found"
        }), 404

    user = users[username]
    current_points = user.get("current_points", user.get("total_points", 0))

    if current_points < points_required:
        return jsonify({
            "success": False,
            "message": "Not enough current points to redeem this reward."
        }), 400

    user["current_points"] = current_points - points_required

    if "redemption_history" not in user:
        user["redemption_history"] = []

    user["redemption_history"].insert(0, {
        "reward_name": reward_name,
        "points_spent": points_required,
        "redeemed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    save_data(users)

    return jsonify({
        "success": True,
        "message": f"{reward_name} redeemed successfully.",
        "remaining_points": user["current_points"],
        "total_points": user.get("total_points", 0)
    })

@app.route("/redemption-history", methods=["GET"])
def redemption_history():
    username = request.args.get("username")
    users = load_data()

    if not username or username not in users:
        return jsonify({
            "success": False,
            "message": "user not found"
        }), 404

    history = users[username].get("redemption_history", [])

    return jsonify({
        "success": True,
        "history": history
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
