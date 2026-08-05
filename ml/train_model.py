# Purpose: Train a Logistic Regression model and check how well it predicts.

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, balanced_accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

#load file and clea up the drasw
df = pd.read_csv("database/data/data.csv")
df = df[df["Winner"] != "Draw"]
#use only these colums because it all we can connect ti the live page
y = df["Winner"]
feature_columns = [
    "R_avg_SIG_STR_landed", "B_avg_SIG_STR_landed",
    "R_avg_TOTAL_STR_landed", "B_avg_TOTAL_STR_landed",
    "R_avg_TD_landed", "B_avg_TD_landed",
    "R_avg_CTRL_time(seconds)", "B_avg_CTRL_time(seconds)",
    "R_Height_cms", "B_Height_cms",
    "R_Reach_cms", "B_Reach_cms",
    "R_Weight_lbs", "B_Weight_lbs",
    "R_age", "B_age",
    "R_wins", "B_wins",
    "R_losses", "B_losses",
    "R_current_win_streak", "B_current_win_streak",
]
X = df[feature_columns]
X = X.fillna(0)

#swap red and blue for 1s and 0s
# Models need numbers, not text, so we convert the answer key too.
y = y.map({"Red": 1, "Blue": 0})

#Train/test split (same as before)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

#this puts every column on the same scale so the model isnt just trained by the largest numbers
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

#this trains the model on the traning data
model = LogisticRegression(max_iter=1000, class_weight="balanced")
model.fit(X_train_scaled, y_train)

#test the data on the test data and get the predictions
predictions = model.predict(X_test_scaled)

#added a random forest model to compare the accuracy of the logistic regression model, it did worse so we are keeping the logistic regression model

# rf_model = RandomForestClassifier(
#     n_estimators=100,       # 100 trees
#     class_weight='balanced', # same red blue balance as logistic regression
#     random_state=42          # makes the "randomness" repeatable
# )
# rf_model.fit(X_train, y_train)

# rf_predictions = rf_model.predict(X_test)

# rf_accuracy = accuracy_score(y_test, rf_predictions)
# print("\n--- Random Forest ---")
# print("Accuracy:", rf_accuracy)
# print("Confusion Matrix:")
# print(confusion_matrix(y_test, rf_predictions))


#get the grade and print it out
accuracy = accuracy_score(y_test, predictions)
print("Accuracy:", accuracy)

balanced_acc = balanced_accuracy_score(y_test, predictions)
print("Balanced Accuracy:", balanced_acc)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

joblib.dump(model, "ml/model.pkl")
joblib.dump(scaler, "ml/scaler.pkl")

print("\nModel and scaler saved to ml/model.pkl and ml/scaler.pkl")
