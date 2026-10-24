"""Rebuild Shanghai's pinned offline data. Default is the full-city profile."""
from pathlib import Path
import argparse, runpy, os
root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--profile',choices=['citywide','central-b'],default='citywide')
a=parser.parse_args()
if a.profile=='central-b':runpy.run_path(str(root/'build-central.py'),run_name='__main__')
else:runpy.run_path(str(root/'build-citywide.py'),run_name='__main__')
