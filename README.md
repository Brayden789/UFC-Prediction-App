# UFC Prediction App

A full-stack web app that predicts UFC fight outcomes using a machine learning model trained on real historical fight data. Search for any two fighters, and the app pulls their live stats from a PostgreSQL database, runs them through a trained Logistic Regression model, and returns a predicted winner with a confidence score.

## Features

- **Fighter search and browsing** — search by name or filter by weight class
- **Fighter profiles** — stats, record, and full fight history
- **Fight prediction** — pick any two fighters and get a live, model-generated prediction with a confidence percentage
- **Two prediction modes** — Pound-for-Pound (any two fighters) and By Weight Class (realistic same-division matchups)

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** FastAPI (Python), uvicorn
- **Database:** PostgreSQL
- **Machine Learning:** scikit-learn (Logistic Regression, StandardScaler), pandas, joblib
- **Data source:** [Kaggle UFC dataset](https://www.kaggle.com/datasets/rajeevw/ufcdata) (~6,000 fights through early 2021)

## How It Works

### The prediction pipeline

1. User selects two fighters in the UI
2. The backend calculates each fighter's **live career averages** from their fight history in PostgreSQL (striking, takedowns, control time, physical stats, win/loss record, current streak)
3. Those stats are scaled using a saved `StandardScaler` and passed to a trained Logistic Regression model
4. The model returns a predicted winner and confidence score

### Key ML decisions and what I learned

**Class imbalance:** The training data is skewed — Red corner fighters win about 66% of fights (Red corner is typically the higher-ranked or defending fighter). A naive model could hit ~66% accuracy just by always guessing Red without learning anything real. I used `class_weight='balanced'` this made sure the sides were balanced by making the mistakes on blue count as more

**Model comparison:** I trained and compared Logistic Regression against Random Forest (including a `balanced_subsample` variant). The Random forest model showed lower accuracy with `class_weight='balanced'` so i went with the Logistic Regression

**Matching the model to real production data:** The original model was trained on 135 features from a Kaggle CSV. When I built the live `/predict` endpoint, I discovered my actual PostgreSQL database only stores a subset of those stats i had to then retrain the model with all of the stats from the seed so i could actually use it to predict specific fights. This dropped the accuracy from 66% to 64%

**A data quality gap:** While building the live stats query, I found that two columns (`sig_strike_pct`, `takedown_pct`) were `NULL` for every single row in the database — a bug in the original seeding script that only ever extracted the "landed" half of `"41 of 103"`-style strings, never the "attempted" half needed to calculate a percentage. I removed those features from the model rather than train on data the live app can't provide, and documented the fix for a future pass.

**A subtle bias bug:** Early testing showed the same two fighters could get a *different* predicted winner depending on which one was arbitrarily labeled "Red" vs "Blue" in the request. This traced back to the model learning real historical asymmetry between the Red and Blue columns during training (Red genuinely wins more often in the data). The fix: the `/predict` endpoint now runs the matchup both ways internally and averages the results, making the outcome independent of arbitrary corner assignment.

## Known Limitations

- The model has no explicit concept of weight class — "Pound-for-Pound" mode allows comparing fighters across weight classes by design, but predictions for large physical mismatches (e.g. Heavyweight vs Flyweight) fall outside anything the model saw in training and should be read as hypothetical, not realistic.
- `sig_strike_pct` and `takedown_pct` are not currently used as features due to a data gap in the seeded database, they are most likely in the original dataset but need to be pulled out
- Data only goes through early 2021 (the range of the source dataset).

## Future Improvements

- Fix the seeding script to recover strike/takedown percentage data and retrain with those features included
- Populate `weight_class` directly on the fighters table (currently derived via a join) and use it to warn on cross-weight-class predictions
- Update the dataset to have all recent fights
