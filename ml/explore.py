# explore.py
# Purpose: Load data.csv and get a first look at what we're working with
# before we do any actual training.

import pandas as pd

# pandas is a library for working with tabular data (rows and columns) in Python.
# Think of it like Excel, but controlled with code instead of clicking around.
# A "DataFrame" is pandas' name for a table of data.

# Load the CSV into a DataFrame
df = pd.read_csv("database/data/data.csv")

# .shape tells us (number of rows, number of columns)
print("Shape (rows, columns):", df.shape)

# .columns lists every column name — useful to actually see what stats we have
print("\nColumn names:")
print(df.columns.tolist())

# .head() shows the first 5 rows, so we can see real values, not just names
print("\nFirst 5 rows:")
print(df.head())

# This checks how balanced our target is — remember the "lazy model predicts
# Red every time" problem we talked about? This tells us if that's a risk.
print("\nWinner value counts:")
print(df["Winner"].value_counts())