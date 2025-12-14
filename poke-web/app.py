from flask import Flask, render_template, jsonify, request
import sqlite3
import os

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "pokemon.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def index():
    return render_template("index.html")

# ✅ 지역 목록
@app.route("/api/locations")
def locations():
    db = get_db()
    rows = db.execute(
        "SELECT Lid, Lname FROM location ORDER BY Lid"
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

# ✅ 지역별 등장 포켓몬
@app.route("/api/encounters")
def encounters():
    location_id = request.args.get("location_id")

    db = get_db()
    rows = db.execute("""
        SELECT
            p.Pname,
            p.type1,
            p.type2,
            e.min_level,
            e.max_level
        FROM encounter e
        JOIN pokemon p ON p.Pid = e.pokemon_id
        WHERE e.location_id = ?
        ORDER BY p.Pname
    """, (location_id,)).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])

# ✅ 포켓몬 이름 → 등장 지역 검색
@app.route("/api/search/pokemon")
def search_pokemon():
    keyword = request.args.get("q", "").strip()
    if not keyword:
        return jsonify([])

    db = get_db()
    rows = db.execute("""
        SELECT DISTINCT
            l.Lid,
            l.Lname
        FROM encounter e
        JOIN pokemon p ON p.Pid = e.pokemon_id
        JOIN location l ON l.Lid = e.location_id
        WHERE p.Pname LIKE ?
        ORDER BY l.Lid
    """, (f"%{keyword}%",)).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])

if __name__ == "__main__":
    app.run(debug=True)
