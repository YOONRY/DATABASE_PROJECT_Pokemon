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


# =========================
# 지역 목록
# =========================
@app.route("/api/locations")
def locations():
    db = get_db()
    rows = db.execute(
        "SELECT Lid, Lname FROM location ORDER BY Lid"
    ).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# =========================
# 지역별 인카운터
# =========================
@app.route("/api/encounters")
def encounters():
    location_id = request.args.get("location_id")

    db = get_db()
    rows = db.execute("""
        SELECT
            p.Pid,
            p.Pname,
            p.type1,
            p.type2,
            e.min_level,
            e.max_level
        FROM encounter e
        JOIN pokemon p ON p.Pid = e.pokemon_id
        WHERE e.location_id = ?
        ORDER BY p.Pid
    """, (location_id,)).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])


# =========================
# 포켓몬 이름 → 지역 검색
# =========================
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


# =========================
# 타입 목록
# =========================
@app.route("/api/types")
def types():
    db = get_db()
    rows = db.execute("""
        SELECT DISTINCT type1 AS type FROM pokemon
        UNION
        SELECT DISTINCT type2 AS type FROM pokemon WHERE type2 IS NOT NULL
        ORDER BY type
    """).fetchall()
    db.close()
    return jsonify([r["type"] for r in rows])


# =========================
# 타입 → 포켓몬
# =========================
@app.route("/api/type/<type_name>")
def pokemons_by_type(type_name):
    db = get_db()
    rows = db.execute("""
        SELECT DISTINCT
            Pid,
            Pname,
            type1,
            type2
        FROM pokemon
        WHERE type1 = ? OR type2 = ?
        ORDER BY Pid
    """, (type_name, type_name)).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])


# =========================
# 포켓몬 → 지역
# =========================
@app.route("/api/pokemon/<int:pid>/locations")
def locations_by_pokemon(pid):
    db = get_db()
    rows = db.execute("""
        SELECT DISTINCT
            l.Lid,
            l.Lname
        FROM encounter e
        JOIN location l ON e.location_id = l.Lid
        WHERE e.pokemon_id = ?
        ORDER BY l.Lid
    """, (pid,)).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

# =========================
# 포켓몬 이름 자동완성
# =========================
@app.route("/api/pokemon/autocomplete")
def pokemon_autocomplete():
    keyword = request.args.get("q", "").strip()
    if not keyword:
        return jsonify([])

    db = get_db()
    rows = db.execute("""
        SELECT
            Pid,
            Pname
        FROM pokemon
        WHERE Pname LIKE ?
        ORDER BY Pid
        LIMIT 10
    """, (f"{keyword}%",)).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])


if __name__ == "__main__":
    app.run(debug=True)
