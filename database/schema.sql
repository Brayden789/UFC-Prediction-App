-- UFC Prediction App Database Schema
--all information for each fighter, including name, nickname
CREATE TABLE fighters (
    fighter_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    nationality VARCHAR(100),
    birthplace VARCHAR(100),
    association VARCHAR(100),
    fighting_out_of VARCHAR(100),
    date_of_birth DATE,
    height VARCHAR(20),
    weight VARCHAR(20),
    reach VARCHAR(20),
    stance VARCHAR(20),
    weight_class VARCHAR(50)
);
--all info for ufc event, including date, location, venue, and event type (e.g., UFC Fight Night, UFC Pay-Per-View)
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    date DATE,
    location VARCHAR(200),
    venue VARCHAR(200),
    event_type VARCHAR(100)
);
--all info for each fight, including the fighters involved, the winner, method of victory, round, time, and weight class
CREATE TABLE fights (
    fight_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id),
    winner_id INT REFERENCES fighters(fighter_id),
    method VARCHAR(100),
    round INT,
    time VARCHAR(10),
    weight_class VARCHAR(100)
);
--detailed fight statistics for each fighter in each fight, including significant strikes, takedowns, control time, etc.
CREATE TABLE fight_stats (
    stat_id SERIAL PRIMARY KEY,
    fight_id INT REFERENCES fights(fight_id),
    fighter_id INT REFERENCES fighters(fighter_id),
    significant_strikes INT,
    sig_strike_pct FLOAT,
    total_strikes INT,
    total_strike_pct FLOAT,
    takedowns INT,
    takedown_pct FLOAT,
    takedown_defense FLOAT,
    control_time VARCHAR(20)
);