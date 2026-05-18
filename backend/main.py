from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# --- CREATE THE APP --- creates fastAPI
app = FastAPI(title="UFC Prediction API")

# --- CORS MIDDLEWARE ---
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
    cur.execute("SELECT * FROM fighters WHERE name ILIKE %s ORDER BY name LIMIT 20", (f"%{name}%",))
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