# Purpose: Train a Logistic Regression model and check how well it predicts.

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler

#load file and clea up the drasw
df = pd.read_csv("database/data/data.csv")
df = df[df["Winner"] != "Draw"]
#drop the columns that are not useful for the model
y = df["Winner"]
columns_to_drop = [
    "Winner", "R_fighter", "B_fighter", "Referee", "date",
    "location", "weight_class", "R_Stance", "B_Stance"
]
X = df.drop(columns=columns_to_drop)
X = X.fillna(0)

#swap red and blue for 1s and 0s
# Models need numbers, not text, so we convert the answer key too.
y = y.map({"Red": 1, "Blue": 0})

#Train/test split (same as before)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)\

#this puts every column on the same scale so the model isnt just trained by the largest numbers
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

#this trains the model on the traning data
model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

#test the data on the test data and get the predictions
predictions = model.predict(X_test_scaled)


#get the grade and print it out
accuracy = accuracy_score(y_test, predictions)
print("Accuracy:", accuracy)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))