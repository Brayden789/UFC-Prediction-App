#have to changed the ml model to onlu use data avaible to each fighter

feature_columns = [
    "R_avg_SIG_STR_pct", "B_avg_SIG_STR_pct",
    "R_avg_SIG_STR_landed", "B_avg_SIG_STR_landed",
    "R_avg_TOTAL_STR_landed", "B_avg_TOTAL_STR_landed",
    "R_avg_TD_pct", "B_avg_TD_pct",
    "R_avg_TD_landed", "B_avg_TD_landed",
    "R_avg_CTRL_time(seconds)", "B_avg_CTRL_time(seconds)",
    "R_Height_cms", "B_Height_cms",
    "R_Reach_cms", "B_Reach_cms",
    "R_Weight_lbs", "B_Weight_lbs",
    "R_age", "B_age",
]

X = df[feature_columns]
X = X.fillna(0)