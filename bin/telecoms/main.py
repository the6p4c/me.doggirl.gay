#!/usr/bin/env python3
import os
from pathlib import Path

from datasets.exchanges import get_gpx as get_exchanges_gpx
from datasets.payphones import get_gpx as get_payphones_gpx


def update_exchanges(root: Path):
    exchanges = get_exchanges_gpx()

    with open(root / "public/telecoms/exchanges.gpx", "w") as f:
        f.write(exchanges.to_xml())


def update_payphones(root: Path):
    payphones = get_payphones_gpx()

    with open(root / "public/telecoms/payphones.gpx", "w") as f:
        f.write(payphones.to_xml())


if __name__ == "__main__":
    root = Path(os.path.dirname(os.path.realpath(__file__))) / ".." / ".."

    update_exchanges(root)
    update_payphones(root)
