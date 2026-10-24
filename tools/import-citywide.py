"""Extract reproducible local-metre features from the pinned full Shanghai PBF."""
from pathlib import Path
import json, math, re, hashlib
import osmium
from shapely import wkb, make_valid, transform
from shapely.geometry import shape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/source/citywide'
DERIVED = ROOT / 'data/derived'
ORIGIN = (121.495, 31.237)
rad = math.pi / 180
e2 = 6.69437999014e-3
s = math.sin(ORIGIN[1] * rad)
SX = rad * 6378137 / math.sqrt(1 - e2 * s*s) * math.cos(ORIGIN[1] * rad)
SZ = rad * 6378137 * (1-e2) / (1-e2*s*s)**1.5
DISTRICTS = {'黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'}
CLASSES = {'motorway':'expy','trunk':'major','primary':'major','secondary':'minor','tertiary':'local','residential':'local','unclassified':'local','living_street':'local','service':'local','pedestrian':'pedestrian','footway':'pedestrian'}
for kind in ['motorway','trunk','primary','secondary','tertiary']:
    CLASSES[kind+'_link'] = 'link'

def project(lon,lat):
    return ((lon-ORIGIN[0])*SX, -(lat-ORIGIN[1])*SZ)

def polygons(g):
    if g.is_empty: return []
    if g.geom_type == 'Polygon':
        return [[[[round(x,2),round(y,2)] for x,y in ring.coords] for ring in [g.exterior,*g.interiors]]]
    return [p for sub in getattr(g,'geoms',[]) for p in polygons(sub)]

class Importer(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.factory=osmium.geom.WKBFactory()
        self.roads=[]; self.coast=[]; self.buildings=[]; self.areas=[]; self.districts=[]; self.boundary=None
        self.skipped=0

    def way(self,w):
        kind=w.tags.get('highway')
        coast=w.tags.get('natural')=='coastline'
        if kind not in CLASSES and not coast:return
        try: pts=[project(n.lon,n.lat) for n in w.nodes]
        except osmium.InvalidLocationError:
            self.skipped+=1; return
        if len(pts)<2:return
        if coast:self.coast.append([[round(x,2),round(z,2)] for x,z in pts])
        if kind not in CLASSES or w.tags.get('access') in ('no','private') or w.tags.get('area')=='yes':return
        name=w.tags.get('name:zh') or w.tags.get('name','')
        tunnel=w.tags.get('tunnel') not in (None,'no','false')
        bridge=w.tags.get('bridge') not in (None,'no','false')
        try:layer=int(w.tags.get('layer','0'))
        except ValueError:layer=0
        self.roads.append({'id':'osm-way-'+str(w.id),'name':name,'class':CLASSES[kind],
            'points':[[round(x,2),2.12,round(z,2)] for x,z in pts],
            'nodeIds':[str(n.ref) for n in w.nodes], 'highway':kind,'oneway':w.tags.get('oneway') in ('yes','1','-1'),
            'reverse':w.tags.get('oneway')=='-1','bridge':bridge,'tunnel':tunnel,'layer':layer,
            'mode':'person' if CLASSES[kind]=='pedestrian' else 'car',
            'directionSource':'OSM:oneway','levelSource':'OSM:bridge/tunnel/layer'})

    def area(self,a):
        t=a.tags; name=t.get('name:zh') or t.get('name','')
        admin=t.get('boundary')=='administrative' and (a.orig_id()==913067 or name in DISTRICTS)
        building=t.get('building') not in (None,'no')
        kind=('water' if t.get('natural')=='water' or t.get('waterway')=='riverbank' or t.get('landuse')=='reservoir' else
              'park' if t.get('leisure') in ('park','garden') else
              'green' if t.get('landuse') in ('forest','grass','meadow','recreation_ground') or t.get('natural') in ('wood','scrub') else
              t.get('landuse') if t.get('landuse') in ('residential','commercial','retail','industrial','farmland','farmyard','orchard') else None)
        if not (admin or building or kind):return
        try:
            geom=make_valid(transform(wkb.loads(self.factory.create_multipolygon(a),hex=True),project,interleaved=False))
            if geom.is_empty:return
        except (RuntimeError,ValueError):
            self.skipped+=1;return
        if admin:
            if a.orig_id()==913067:self.boundary=polygons(geom)
            elif name in DISTRICTS:self.districts.append({'id':'osm-relation-'+str(a.orig_id()),'name':name,'polygons':polygons(geom)})
        if kind:self.areas.append({'id':('way-' if a.from_way() else 'relation-')+str(a.orig_id()),'kind':kind,'polygons':polygons(geom.simplify(1,preserve_topology=True))})
        if building:
            raw=t.get('height') or t.get('building:height') or ''
            number=re.search(r'[\d.]+',raw)
            try:height=float(number.group()) if number else float(t.get('building:levels','0'))*3.2
            except ValueError:height=0
            source='OSM:height' if number else 'OSM:levels' if height else 'visual-estimate'
            self.buildings.append({'id':('osm-building-way-' if a.from_way() else 'osm-building-relation-')+str(a.orig_id()),'polygons':polygons(geom.simplify(.3,preserve_topology=True)),'h':height,'heightSource':source,'name':name})

def main():
    meta=json.loads((SOURCE/'source.json').read_text())
    path=SOURCE/'shanghai-20261022.osm.pbf'
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest==meta['sha256'],'Pinned source SHA-256 mismatch'
    boundaryFile=SOURCE/'shanghai-boundary.geojson'
    assert hashlib.sha256(boundaryFile.read_bytes()).hexdigest()==meta['administrativeBoundary']['sha256'],'Pinned administrative boundary SHA-256 mismatch'
    h=Importer(); h.apply_file(str(path),locations=True,idx='flex_mem')
    # Extracts can retain a boundary relation while omitting distant member
    # nodes. Supplement only those admin geometries with pinned OSM polygon
    # service responses, never replace them with a rectangular approximation.
    h.boundary=polygons(make_valid(transform(shape(json.loads((SOURCE/'shanghai-boundary.geojson').read_text())),project,interleaved=False)))
    supplements=json.loads((SOURCE/'boundaries-source.json').read_text())
    for supplement in supplements:
        file=SOURCE/f'boundary-{supplement["id"]}.geojson'
        assert hashlib.sha256(file.read_bytes()).hexdigest()==supplement['sha256']
        geom=make_valid(transform(shape(json.loads(file.read_text())),project,interleaved=False))
        h.districts=[d for d in h.districts if d['name']!=supplement['name']]
        h.districts.append({'id':'osm-relation-'+str(supplement['id']),'name':supplement['name'],'polygons':polygons(geom)})
    assert len(h.districts)==16,[(d['name'],d['id']) for d in h.districts]
    assert h.boundary,'Shanghai administrative relation missing from full extract'
    reader=osmium.io.Reader(str(path))
    timestamp=reader.header().get('osmosis_replication_timestamp'); reader.close()
    data={'source':meta,'boundarySources':supplements,'timestamp':timestamp,'roads':h.roads,'coast':h.coast,'buildings':h.buildings,'areas':h.areas,'districts':h.districts,'boundary':h.boundary,'skippedGeometries':h.skipped}
    DERIVED.mkdir(exist_ok=True)
    (DERIVED/'citywide.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
    print(json.dumps({'roads':len(h.roads),'buildings':len(h.buildings),'coastWays':len(h.coast),'areas':len(h.areas),'districts':[d['name'] for d in h.districts],'skippedGeometries':h.skipped,'timestamp':timestamp},ensure_ascii=False),flush=True)

if __name__=='__main__':main()
