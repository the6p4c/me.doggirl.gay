#!/usr/bin/env python3
from __future__ import annotations

import gpxpy
from pydantic import BaseModel, Field
import requests

from gpx import make_gpx, make_waypoint


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


def query(offset: int) -> ExchangesPage:
    url = "https://services.ga.gov.au/gis/rest/services/Telephone_Exchanges/MapServer/0/Query"
    params = {
        "f": "json",
        "where": "1=1",
        "outFields": "*",
        "resultOffset": offset,
    }

    response = requests.get(url, params)

    return ExchangesPage.model_validate_json(response.text)


def query_all() -> list[Feature]:
    features = []

    while True:
        page = query(len(features))
        features += page.features

        last_page = not page.exceededTransferLimit
        if last_page:
            break

    return features


def get_gpx():
    exchanges = query_all()

    waypoints = []
    for exchange in exchanges:
        name = (
            f"{exchange.attributes.name} ({exchange.attributes.exchangeserviceareaid})"
        )
        lat, lon = exchange.geometry.y, exchange.geometry.x
        if exchange.attributes.address is not None:
            address = f"{exchange.attributes.address}, {exchange.attributes.suburb}, {exchange.attributes.state}"
        else:
            address = f"{exchange.attributes.suburb}, {exchange.attributes.state}"
        status = exchange.attributes.operationalstatus

        waypoints.append(make_waypoint(name, lat, lon, address=address, status=status))

    return make_gpx(waypoints)
