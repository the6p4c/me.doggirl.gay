#!/usr/bin/env python3
from __future__ import annotations
from dataclasses import dataclass

import gpxpy
from gpxpy.parser import mod_etree
from xml.sax import saxutils


@dataclass
class Gpx:
    def __init__(self):
        self.gpx = gpxpy.gpx.GPX()
        self.gpx.nsmap["osmand"] = (
            "https://osmand.net/docs/technical/osmand-file-formats/osmand-gpx"
        )

    def add_waypoint(self, waypoint: Waypoint):
        self.gpx.waypoints.append(waypoint.to_gpx_waypoint())

    def to_xml(self) -> str:
        return self.gpx.to_xml()


@dataclass
class Waypoint:
    latitude: float
    longitude: float
    name: str

    description: str | None

    osmand_icon: str | None
    osmand_color: str | None

    def to_gpx_waypoint(self) -> gpxpy.gpx.GPXWaypoint:
        def make_extension_element(name: str, text: str) -> mod_etree.Element:
            element = mod_etree.Element(name)
            element.text = saxutils.escape(text)
            return element

        waypoint = gpxpy.gpx.GPXWaypoint(self.latitude, self.longitude, name=self.name)

        if self.description is not None:
            waypoint.description = self.description

        if self.osmand_icon is not None:
            waypoint.extensions.append(
                make_extension_element("{osmand}icon", self.osmand_icon)
            )
        if self.osmand_color is not None:
            waypoint.extensions.append(
                make_extension_element("{osmand}color", self.osmand_color)
            )

        return waypoint
