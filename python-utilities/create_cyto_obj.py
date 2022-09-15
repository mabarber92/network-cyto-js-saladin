import pandas as pd
import json
from os import path

basepath = path.dirname(__file__)
print(basepath)

def cyto_obj(data):
    """Takes a path to csv edges list and creates a cyto-supported object"""


    data = data.dropna()
    nodes = data["PERSON ONE"].values.tolist()
    nodes.extend(data["PERSON TWO"].values.tolist())
    nodes = list(dict.fromkeys(nodes))


    net_data = []

    for node in nodes:
        net_data.append({'data': {'id': node, 'betacode': node}})

    edges = data[["PERSON ONE", "PERSON TWO", "CITY"]].values.tolist()

    for edge in edges:
        if type(edge[2]) is str:
            city = edge[2]
        else:
            city = "Unknown"
        net_data.append({'data': {'source': edge[0], 'target': edge[1], 'city': city}})

    return net_data

data_path = path.abspath(path.join(basepath, ".." , "data-source", "Edges-2.csv"))
out_path = path.abspath(path.join(basepath, ".." , "data2.json"))

data = pd.read_csv(data_path)
with open(out_path, "w", encoding = "utf-8-sig") as f:
    f.write(json.dumps(cyto_obj(data), indent = 2))