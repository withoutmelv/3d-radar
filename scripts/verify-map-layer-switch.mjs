import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const checks = [
  {
    name: 'MapFloor accepts a height prop',
    pass: /const MapFloor = \(\{\s*height\s*=\s*0,\s*overlayUrl\s*\}/s.test(source),
  },
  {
    name: 'MapFloor positions itself from height',
    pass: /position=\{\[4,\s*height\s*-\s*0\.15,\s*4\]\}/.test(source),
  },
  {
    name: 'SceneContent computes mapHeight from selectedLayer',
    pass: /const mapHeight = selectedLayer === null \? 0 : selectedLayer \* 2/.test(source),
  },
  {
    name: 'SceneContent computes mapOverlayUrl from selectedLayer',
    pass: /const mapOverlayUrl = selectedLayer === null \? images\[0\] : images\[selectedLayer\]/.test(source),
  },
  {
    name: 'SceneContent renders MapFloor with mapHeight',
    pass: /<MapFloor height=\{mapHeight\} overlayUrl=\{mapOverlayUrl\} \/>/.test(source),
  },
  {
    name: 'LeafletMapSurface renders overlayUrl image',
    pass: /src=\{overlayUrl\}/.test(source),
  },
  {
    name: 'CoordinateSystem does not render MapFloor',
    pass: !/const CoordinateSystem[\s\S]*?<MapFloor\s*\/>[\s\S]*?const RadarPlane/.test(source),
  },
]

const failed = checks.filter((check) => !check.pass)

for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}`)
}

if (failed.length > 0) {
  process.exitCode = 1
}
