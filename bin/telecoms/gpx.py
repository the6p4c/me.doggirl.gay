#!/usr/bin/env python3
import gpxpy
from gpxpy.parser import mod_etree
from xml.sax import saxutils


def make_waypoint(
    name: str, lat: float, lon: float, **extensions: dict[str | None, str]
) -> gpxpy.gpx.GPXWaypoint:
    waypoint = gpxpy.gpx.GPXWaypoint(lat, lon, name=name)

    for name, value in extensions.items():
        element = mod_etree.Element(name)
        element.text = saxutils.escape(value)
        waypoint.extensions.append(element)

    return waypoint


def make_gpx(waypoints: list[gpxpy.gpx.GPXWaypoint]) -> gpxpy.gpx.GPX:
    gpx = gpxpy.gpx.GPX()

    gpx.waypoints.extend(waypoints)

    return gpx
