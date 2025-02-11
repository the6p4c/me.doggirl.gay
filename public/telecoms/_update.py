#!/usr/bin/env python3
from __future__ import annotations
import os
from pathlib import Path
from xml.sax import saxutils

import gpxpy
from gpxpy.parser import mod_etree
from pydantic import BaseModel, Field
import requests


class ExchangesPage(BaseModel):
    features: list[Feature]
    exceededTransferLimit: bool = Field(default=False)


class Feature(BaseModel):
    attributes: Attributes
    geometry: Geometry


class Attributes(BaseModel):
    name: str
    operationalstatus: str
    exchangeserviceareaid: str
    address: str | None
    suburb: str
    state: str


class Geometry(BaseModel):
    x: float
    y: float


def exchanges_query(offset: int) -> ExchangesPage:
    url = "https://services.ga.gov.au/gis/rest/services/Telephone_Exchanges/MapServer/0/Query"
    params = {
        "f": "json",
        "where": "1=1",
        "outFields": "*",
        "resultOffset": offset,
    }

    response = requests.get(url, params)

    return ExchangesPage.model_validate_json(response.text)


def exchanges_query_all() -> list[Feature]:
    features = []

    while True:
        page = exchanges_query(len(features))
        features += page.features

        last_page = not page.exceededTransferLimit
        if last_page:
            break

    return features


def make_waypoint(
    name: str, lat: float, lon: float, **extensions: dict[str | None, str]
):
    waypoint = gpxpy.gpx.GPXWaypoint(lat, lon, name=name)

    for name, value in extensions.items():
        element = mod_etree.Element(name)
        element.text = saxutils.escape(value)
        waypoint.extensions.append(element)

    return waypoint


exchanges = exchanges_query_all()

gpx = gpxpy.gpx.GPX()
for exchange in exchanges:
    name = f"{exchange.attributes.name} ({exchange.attributes.exchangeserviceareaid})"
    lat, lon = exchange.geometry.y, exchange.geometry.x
    if exchange.attributes.address is not None:
        address = f"{exchange.attributes.address}, {exchange.attributes.suburb}, {exchange.attributes.state}"
    else:
        address = f"{exchange.attributes.suburb}, {exchange.attributes.state}"
    status = exchange.attributes.operationalstatus

    gpx_waypoint = make_waypoint(name, lat, lon, address=address, status=status)
    gpx.waypoints.append(gpx_waypoint)

path = Path(os.path.dirname(os.path.realpath(__file__)))
with open(path / "exchanges.gpx", "w") as f:
    f.write(gpx.to_xml())
