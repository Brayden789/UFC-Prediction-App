import pandas as pd
from sklearn.model_selection import train_test_split

#load the database
df = pd.read_csv("database/data/data.csv")

# We're only predicting Red vs Blue, so a Draw doesn't fit the question, the dataframe only takes the true rows
df = df[df["Winner"] != "Draw"]

# y is the target were trying to get
y = df["Winner"]


# Drop columns that aren't useful numeric stats
columns_to_drop = [
    "Winner", "R_fighter", "B_fighter", "Referee", "date",
    "location", "weight_class", "R_Stance", "B_Stance"
]
X = df.drop(columns=columns_to_drop)


# NaN usually means "no prior fight data yet" (e.g. a debuting fighter).
X = X.fillna(0)

# 80% of rows go to training, 20% get held back to test on later.
# random_state=42 just makes the "random" split repeatable every time we run this.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training rows:", X_train.shape[0])
print("Testing rows:", X_test.shape[0])
print("Number of features:", X_train.shape[1])