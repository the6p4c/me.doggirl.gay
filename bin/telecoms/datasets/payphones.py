#!/usr/bin/env python3
from pydantic import BaseModel, TypeAdapter

from gpx import Gpx, Waypoint


class Payphone(BaseModel):
    latitude: float
    longitude: float
    address: str
    state: str | None
    postcode: int
    phone_attributes: str
    cabinet_id: str
    fnn: str | None
    cli: str


def query_all() -> list[Payphone]:
    with open("bin/telecoms/datasets/payphones.json", "r") as f:
        return TypeAdapter(list[Payphone]).validate_json(f.read())


def get_gpx() -> Gpx:
    payphones = query_all()
    gpx = Gpx()

    for payphone in payphones:
        if payphone.state is not None:
            address = f"{payphone.address}, {payphone.state}, {payphone.postcode:04}"
        else:
            address = f"{payphone.address}, {payphone.postcode:04}"

        attributes = payphone.phone_attributes
        attributes = attributes.replace(",", ", ")
        attributes = attributes.replace("WIFI", "Wi-Fi")

        if payphone.fnn is not None:
            fnn = payphone.fnn.removeprefix("PH:")
        else:
            fnn = "<missing>"

        description = (
            f"<strong>Address:</strong> {address}<br>"
            f"<strong>FNN:</strong> {fnn}<br>"
            f"<strong>CLI:</strong> {payphone.cli}<br>"
            f"<strong>Attributes:</strong> {attributes}"
        )

        waypoint = Waypoint(
            latitude=payphone.latitude,
            longitude=payphone.longitude,
            name=payphone.cabinet_id,
            description=description,
            osmand_icon="amenity_parking",
            osmand_color="#0d54ff",
        )
        gpx.add_waypoint(waypoint)

    return gpx
