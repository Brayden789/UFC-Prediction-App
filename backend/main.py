from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# --- CREATE THE APP --- creates fastAPI
app = FastAPI(title="UFC Prediction API")

# --- CORS MIDDLEWARE --- connects frontend to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE CONNECTION ---
def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn

# --- ROUTES ---
@app.get("/")
def root():
    return {"message": "UFC Prediction API is running"}

@app.get("/fighters") #when this happens on the frontend it will trigger this function to run and return the fighters in the database
def get_fighters(limit: int = 20, offset: int = 0):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM fighters ORDER BY name LIMIT %s OFFSET %s", (limit, offset)) #make PostgreSQL return rows as dictionaries instead of tuples
    fighters = cur.fetchall()
    cur.close()
    conn.close()
    return fighters

@app.get("/fighters/search") #when this happens on the frontend it will trigger this function to run and return the fighters in the database that match the search query
def search_fighters(name: str):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
    SELECT * FROM fighters
    WHERE name ILIKE %s
    ORDER BY
        CASE WHEN name ILIKE %s THEN 0 ELSE 1 END,
        name
    LIMIT 20
""", (f"%{name}%", f"{name}%"))
    fighters = cur.fetchall()
    cur.close()
    conn.close()
    return fighters

@app.get("/fighters/{fighter_id}") #when this happens on the frontend it will trigger this function to run and return the fighter in the database that matches the fighter_id
def get_fighter(fighter_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM fighters WHERE fighter_id = %s", (fighter_id,))
    fighter = cur.fetchone()
    cur.close()
    conn.close()
    if fighter is None:
        raise HTTPException(status_code=404, detail="Fighter not found")
    return fighter

@app.get("/weightclasses")#when this happens on the frontend it will trigger this function to run and return the weight classes in the database
def get_weightclasses():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT DISTINCT weight_class 
        FROM fights 
        WHERE weight_class IN (
            'Heavyweight Bout',
            'Light Heavyweight Bout',
            'Middleweight Bout',
            'Welterweight Bout',
            'Lightweight Bout',
            'Featherweight Bout',
            'Bantamweight Bout',
            'Flyweight Bout',
            'Women''s Strawweight Bout',
            'Women''s Flyweight Bout',
            'Women''s Bantamweight Bout',
            'Women''s Featherweight Bout'
        )
        ORDER BY weight_class
    """)#this selects weight classes from only the ones we wll use an not ones from other organizations or non-standard weight classes that may be in the dataset
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Clean up the labels before returning, so insead of "Heavyweight Bout" it just returns "Heavyweight"
    cleaned = []
    for row in rows:
        label = row["weight_class"].replace(" Bout", "").replace("Women's ", "Women's ")
        cleaned.append({"weight_class": label})
    
    return cleaned

@app.get("/fighters/weightclass/{weight_class}")#when this happens on the frontend it will trigger this function to run and return the fighters in the database that match the weight class
def get_fighters_by_weightclass(weight_class: str):
    # Convert clean name back to database format
    db_weight_class = weight_class + " Bout"
    
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT DISTINCT f.fighter_id, f.name, f.stance, f.height, f.weight, f.reach
        FROM fighters f
        JOIN fight_stats fs ON f.fighter_id = fs.fighter_id
        JOIN fights fi ON fs.fight_id = fi.fight_id
        WHERE fi.weight_class = %s
        ORDER BY f.name
    """, (db_weight_class,))#we use JOIN here to get all the fighters that have fought in that weight class, even if they are not currently in that weight class or have only fought in it once
    fighters = cur.fetchall()
    cur.close()
    conn.close()
    return fighters

@app.get("/fighters/{fighter_name}/fights")#when this happens on the frontend it will trigger this function to run and return the fights in the database that match the fighter_name
def get_fighter_fights(fighter_name: str):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cur.execute("""
        SELECT 
            f.fight_id,
            e.name AS event_name,
            e.date AS event_date,
            f.weight_class,
            f.winner_id,
            f.method,
            f.round,
            f.time,
            opp.fighter_id AS opponent_id,
            opp.name AS opponent_name
        FROM fights f
        JOIN events e ON f.event_id = e.event_id
        JOIN fight_stats fs ON fs.fight_id = f.fight_id 
        JOIN fighters me ON me.fighter_id = fs.fighter_id
        JOIN fight_stats fs2 ON fs2.fight_id = f.fight_id AND fs2.fighter_id != me.fighter_id
        JOIN fighters opp ON opp.fighter_id = fs2.fighter_id
        WHERE LOWER(me.name) = LOWER(%s)
        ORDER BY e.date DESC
    """, (fighter_name,))
    
    fights = cur.fetchall()
    cur.close()
    conn.close()
    return fights

@app.get("/fighters/name/{fighter_name}/record")#when this happens on the frontend it will trigger this function to run and return the record of the fighter in the database that matches the fighter_name
def get_fighter_record(fighter_name: str):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cur.execute("""
        SELECT 
            me.fighter_id,
            COUNT(*) AS total_fights,
            COUNT(CASE WHEN f.winner_id = me.fighter_id THEN 1 END) AS wins,
            COUNT(CASE WHEN f.winner_id != me.fighter_id AND f.winner_id IS NOT NULL THEN 1 END) AS losses,
            COUNT(CASE WHEN f.winner_id IS NULL THEN 1 END) AS no_contests
        FROM fighters me
        JOIN fight_stats fs ON fs.fighter_id = me.fighter_id
        JOIN fights f ON f.fight_id = fs.fight_id
        WHERE LOWER(me.name) = LOWER(%s)
        GROUP BY me.fighter_id
    """, (fighter_name,))
    
    record = cur.fetchone()
    cur.close()
    conn.close()
    
    if not record:
        return {"wins": 0, "losses": 0, "no_contests": 0}
    
    return record


#helper function to get actual control time in seconds instead of a string
def control_time_to_seconds(time_str):
    minutes, seconds = time_str.split(":")
    return int(minutes) * 60 + int(seconds)

#helperfunction to convert height to centimeters
def height_to_cm(height_str):
    if not height_str or height_str.strip() == "":
        return None
    feet, inches = height_str.split("'")
    inches = inches.replace('"', "").strip()
    total_inches = int(feet.strip()) * 12 + int(inches)
    return round(total_inches * 2.54, 2)

#helper function to convert reach to centimeters
def reach_to_cm(reach_str):
    if not reach_str or reach_str.strip() == "":
        return None
    inches = reach_str.replace('"', '').strip()
    return round(int(inches) * 2.54, 2)

#helper fucntion to convert weight to pounds
def weight_to_lbs(weight_str):
    if not weight_str or weight_str.strip() == "":
        return None
    return float(weight_str.replace("lbs.", "").strip())

def get_fighter_averages(fighter_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            AVG(significant_strikes) AS avg_sig_str_landed,
            AVG(total_strikes) AS avg_total_str_landed,
            AVG(takedowns) AS avg_td_landed,
            ARRAY_AGG(control_time) AS control_times_raw
        FROM fight_stats
        WHERE fighter_id = %s
    """, (fighter_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row["control_times_raw"] is None:
        raise HTTPException(status_code=404, detail="No fight stats found for this fighter")

    # Convert each "4:15" string to seconds, then average them ourselves
    control_seconds = [control_time_to_seconds(t) for t in row["control_times_raw"]]
    avg_ctrl_time = sum(control_seconds) / len(control_seconds)

    return {
        "avg_sig_str_landed": row["avg_sig_str_landed"],
        "avg_total_str_landed": row["avg_total_str_landed"],
        "avg_td_landed": row["avg_td_landed"],
        "avg_ctrl_time": avg_ctrl_time,
    }



def get_fighter_physicals(fighter_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT height, reach, weight, 
        Extract(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) AS age
        FROM fighters
        WHERE fighter_id = %s
    """, (fighter_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Fighter not found")

    return {
        "height": height_to_cm(row["height"]),
        "reach": reach_to_cm(row["reach"]),
        "weight": weight_to_lbs(row["weight"]),
        "age": row["age"],
    }

@app.get("/test-physicals/{fighter_id}")
def test_physicals(fighter_id: int):
    return get_fighter_physicals(fighter_id)

@app.get("/test-averages/{fighter_id}")
def test_averages(fighter_id: int):
    return get_fighter_averages(fighter_id)
