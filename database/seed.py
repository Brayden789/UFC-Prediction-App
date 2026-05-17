import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
print("Password Loaded", os.getenv("DB_PASSWORD"))

# --- CONNECTION ---
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

def parse_landed(value):
    """Extracts the first number from strings like '41 of 103', or returns None"""
    if pd.isna(value):
        return None
    parts = str(value).split(" of ")
    try:
        return int(parts[0])
    except ValueError:
        return None


cur = conn.cursor()

print("Connected to database successfully")

# --- LOAD FIGHTER DATA ---
fighters_df = pd.read_csv("database/data/raw_fighter_details.csv")
print(f"Loaded {len(fighters_df)} fighters")

fighter_name_to_id = {}

for _, row in fighters_df.iterrows():
    cur.execute("""
        INSERT INTO fighters (name, stance, date_of_birth, height, weight, reach)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING fighter_id
    """, (
        row["fighter_name"],
        row["Stance"] if pd.notna(row["Stance"]) else None,
        row["DOB"] if pd.notna(row["DOB"]) else None,
        row["Height"] if pd.notna(row["Height"]) else None,
        row["Weight"] if pd.notna(row["Weight"]) else None,
        row["Reach"] if pd.notna(row["Reach"]) else None,
    ))
    fighter_id = cur.fetchone()[0]
    fighter_name_to_id[row["fighter_name"]] = fighter_id

conn.commit()
print(f"Inserted {len(fighter_name_to_id)} fighters into database")

# --- LOAD FIGHT DATA ---
fights_df = pd.read_csv("database/data/raw_total_fight_data.csv", sep=";")
print(f"Loaded {len(fights_df)} fights")

skipped = 0

for _, row in fights_df.iterrows():
    r_name = row["R_fighter"]
    b_name = row["B_fighter"]
    winner_name = row["Winner"]

    # Skip fight if either fighter isn't in our fighters table
    if r_name not in fighter_name_to_id or b_name not in fighter_name_to_id:
        skipped += 1
        continue

    # --- Insert event ---
    cur.execute("""
        INSERT INTO events (name, date, location)
        VALUES (%s, %s, %s)
        RETURNING event_id
    """, (
        row["Fight_type"],
        row["date"] if pd.notna(row["date"]) else None,
        row["location"] if pd.notna(row["location"]) else None,
    ))
    event_id = cur.fetchone()[0]

    # --- Insert fight ---
    winner_id = fighter_name_to_id.get(winner_name)

    cur.execute("""
        INSERT INTO fights (event_id, winner_id, method, round, time, weight_class)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING fight_id
    """, (
        event_id,
        winner_id,
        row["win_by"] if pd.notna(row["win_by"]) else None,
        row["last_round"] if pd.notna(row["last_round"]) else None,
        row["last_round_time"] if pd.notna(row["last_round_time"]) else None,
        row["Fight_type"] if pd.notna(row["Fight_type"]) else None,
    ))
    fight_id = cur.fetchone()[0]

    # --- Insert fight stats for both fighters ---
    for prefix, fighter_name in [("R", r_name), ("B", b_name)]:
        fighter_id = fighter_name_to_id[fighter_name]
        cur.execute("""
            INSERT INTO fight_stats (fight_id, fighter_id, significant_strikes, total_strikes, takedowns, control_time)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            fight_id,
            fighter_id,
            parse_landed(row[f"{prefix}_SIG_STR."]),
            parse_landed(row[f"{prefix}_TOTAL_STR."]),
            parse_landed(row[f"{prefix}_TD"]),
            row[f"{prefix}_CTRL"] if pd.notna(row[f"{prefix}_CTRL"]) else None,
        ))

conn.commit()
print(f"Fights inserted. Skipped {skipped} fights due to missing fighters.")

cur.close()
conn.close()
print("Done!")