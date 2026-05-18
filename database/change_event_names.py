import requests
from bs4 import BeautifulSoup
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Connect to database
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST")
)
cur = conn.cursor()

# Scrape UFCStats for all completed events
print("Scraping UFCStats...")
response = requests.get("http://www.ufcstats.com/statistics/events/completed?page=all")
soup = BeautifulSoup(response.text, "html.parser")

# Find all event rows in the table
rows = soup.find_all("tr", class_="b-statistics__table-row")

updated = 0
not_found = 0

for row in rows:
    # Get the event name
    name_tag = row.find("a", class_="b-link")
    # Get the date
    date_tag = row.find("span", class_="b-statistics__date")
    
    if not name_tag or not date_tag:
        continue
    
    event_name = name_tag.text.strip()
    date_str = date_tag.text.strip()
    
    # Convert "March 04, 2023" to "2023-03-04" so it matches our database format
    from datetime import datetime
    try:
        date = datetime.strptime(date_str, "%B %d, %Y").strftime("%Y-%m-%d")
    except ValueError:
        continue
    
    # Update all events in our database that match this date
    cur.execute("""
        UPDATE events SET name = %s WHERE date = %s
    """, (event_name, date))
    
    if cur.rowcount > 0:
        updated += cur.rowcount
        print(f"Updated {cur.rowcount} rows: {date} → {event_name}")
    else:
        not_found += 1

conn.commit()
cur.close()
conn.close()

print(f"\nDone! Updated {updated} events. {not_found} dates had no match.")