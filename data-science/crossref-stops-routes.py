import json

stops = json.load(open("./output/stops.json"))
stops_alt = json.load(open("./output/stops_alt.json"))

stop_abbr = {
    "OR": "ORANGE",
    "SV": "SILVER",
    "BL": "BLUE",
    "YL": "YELLOW",
    "GR": "GREEN",
    "RD": "RED",
}

for stop in stops:
    if stop["location_type"] != 1:
        stop["route_ids"] = []
        continue
    name_trimmed = stop["stop_id"].replace("STN_", "")
    route_codes = set()
    # find stop in stops_alt by Station.Code
    for stop_alt in stops_alt:
        if stop_alt["Code"] == name_trimmed:
            if stop_alt["LineCode1"] is not None:
                route_codes.add(stop_abbr[stop_alt["LineCode1"]])
            if stop_alt["LineCode2"] is not None:
                route_codes.add(stop_abbr[stop_alt["LineCode2"]])
            if stop_alt["LineCode3"] is not None:
                route_codes.add(stop_abbr[stop_alt["LineCode3"]])
            if stop_alt["LineCode4"] is not None:
                route_codes.add(stop_abbr[stop_alt["LineCode4"]])
            if stop_alt['StationTogether1'] in stop_abbr:
                lc_1 = stop_alt['StationTogether1']
                if lc_1["LineCode1"] is not None:
                    route_codes.add(stop_abbr[lc_1["LineCode1"]])
                if lc_1["LineCode2"] is not None:
                    route_codes.add(stop_abbr[lc_1["LineCode2"]])
                if lc_1["LineCode3"] is not None:
                    route_codes.add(stop_abbr[lc_1["LineCode3"]])
                if lc_1["LineCode4"] is not None:
                    route_codes.add(stop_abbr[lc_1["LineCode4"]])
    stop["route_ids"] = list(route_codes)

with open("./output/stops-new.json", "w") as f:
    json.dump(stops, f, indent=4)
