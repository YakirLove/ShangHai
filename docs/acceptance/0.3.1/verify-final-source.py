"""Verify the final CSS-only source transition, then build its archive in isolation.

The full geography/test reproduction is retained in source-reproduction-geography.json.
Reject any other source change before reusing that expensive validation.
"""
from pathlib import Path
import hashlib,json,subprocess,tarfile,tempfile,time

ROOT=Path(__file__).resolve().parents[3]
EVIDENCE=Path(__file__).resolve().parent
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
version=read(ROOT/'package.json')['version']
archive=ROOT/'release'/f'shanghai-waterfront-{version}-source.tar.gz'
baseline=read(EVIDENCE/'source-geography-members.json')
geography=read(EVIDENCE/'source-reproduction-geography.json')
assert geography['status']=='passed' and geography['archiveSHA256']==baseline['archiveSHA256']
with tarfile.open(archive) as t:
    members={m.name:hashlib.sha256(t.extractfile(m).read()).hexdigest() for m in t if m.isfile()}
added=sorted(members.keys()-baseline['members'].keys())
removed=sorted(baseline['members'].keys()-members.keys())
changed=sorted(k for k in members.keys()&baseline['members'].keys() if members[k]!=baseline['members'][k])
transition={'previousArchiveSHA256':baseline['archiveSHA256'],'finalArchiveSHA256':digest(archive),'changedFiles':changed,'addedFiles':added,'removedFiles':removed,'unchangedFiles':len(members)-len(changed)}
assert changed==['style.css'] and not added and not removed,transition
(EVIDENCE/'source-transition.json').write_text(json.dumps(transition,indent=2))
start=time.time()
result={'archiveSHA256':digest(archive),'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'sourceTransition':transition,'geographyReproduction':{'evidence':'source-reproduction-geography.json','status':'passed','seconds':geography['seconds'],'note':'All final source files except style.css are byte-identical to the fully regenerated and tested archive. This includes generators, pinned inputs, tests, dependencies and public/data.'},'commands':[],'assets':[]}
try:
    with tempfile.TemporaryDirectory(prefix='source-style-',dir=ROOT/'.cache') as directory, (EVIDENCE/'source-reproduction.log').open('w') as log:
        stage=Path(directory)
        for args in [['tar','-xzf',str(archive),'-C',str(stage)],['npm','ci'],['npm','run','build']]:
            began=time.time();completed=subprocess.run(['rtk','proxy',*args],cwd=stage,stdout=log,stderr=log)
            result['commands'].append({'args':args,'exitCode':completed.returncode,'seconds':time.time()-began})
            completed.check_returncode()
        expected={p.relative_to(ROOT/'dist').as_posix() for p in (ROOT/'dist').rglob('*') if p.is_file()}
        actual={p.relative_to(stage/'dist').as_posix() for p in (stage/'dist').rglob('*') if p.is_file()}
        assert expected==actual,'Output file list differs'
        for name in sorted(expected):
            sha=digest(ROOT/'dist'/name);assert digest(stage/'dist'/name)==sha,name
            result['assets'].append({'path':name,'sha256':sha})
        result['filesCompared']=len(expected);result['status']='passed'
except Exception as error:
    result['status']='failed';result['error']=repr(error)
finally:
    result['seconds']=time.time()-start
    (EVIDENCE/'source-reproduction.json').write_text(json.dumps(result,indent=2))
print({k:v for k,v in result.items() if k not in ['assets','commands']})
assert result['status']=='passed',result.get('error')
