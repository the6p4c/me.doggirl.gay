#!/usr/bin/env python3
import os
from pathlib import Path

from exchanges import get_gpx as get_exchanges_gpx

if __name__ == "__main__":
    exchanges = get_exchanges_gpx()

    root = Path(os.path.dirname(os.path.realpath(__file__))) / ".." / ".."
    with open(root / "public/telecoms/exchanges.gpx", "w") as f:
        f.write(exchanges.to_xml())
