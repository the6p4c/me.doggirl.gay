#!/usr/bin/env python3
from __future__ import annotations

from pydantic import BaseModel, Field
import requests

from gpx import Gpx, Waypoint


class Page(BaseModel):
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


def query(offset: int) -> Page:
    url = "https://services.ga.gov.au/gis/rest/services/Telephone_Exchanges/MapServer/0/Query"
    params = {
        "f": "json",
        "where": "1=1",
        "outFields": "*",
        "resultOffset": offset,
    }

    response = requests.get(url, params)

    return Page.model_validate_json(response.text)


def query_all() -> list[Feature]:
    features = []

    while True:
        page = query(len(features))
        features += page.features

        last_page = not page.exceededTransferLimit
        if last_page:
            break

    return features


def get_gpx() -> Gpx:
    exchanges = query_all()
    gpx = Gpx()

    for exchange in exchanges:
        if exchange.attributes.address is not None:
            address = f"{exchange.attributes.address}, {exchange.attributes.suburb}, {exchange.attributes.state}"
        else:
            address = f"{exchange.attributes.suburb}, {exchange.attributes.state}"

        description = (
            f"<strong>Address:</strong> {address}<br>"
            f"<strong>Status:</strong> {exchange.attributes.operationalstatus}"
        )

        waypoint = Waypoint(
            latitude=exchange.geometry.y,
            longitude=exchange.geometry.x,
            name=f"{exchange.attributes.name} ({exchange.attributes.exchangeserviceareaid})",
            description=description,
            osmand_icon="place_town",
            osmand_color="#f96449",
        )
        gpx.add_waypoint(waypoint)

    return gpx
