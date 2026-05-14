import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const design = readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8')
const mapFloorBlock = source.match(/const MapFloor[\s\S]*?const CoordinateSystem/)?.[0] ?? ''

const checks = [
  {
    name: 'Design standard documents 320px map surface',
    pass: /320px x 320px/.test(design),
  },
  {
    name: 'Map surface size constant is 320',
    pass: /const MAP_SURFACE_SIZE_PX = 320/.test(source),
  },
  {
    name: 'Map surface width uses MAP_SURFACE_SIZE_PX',
    pass: /width: `\$\{MAP_SURFACE_SIZE_PX\}px`/.test(source),
  },
  {
    name: 'Map surface height uses MAP_SURFACE_SIZE_PX',
    pass: /height: `\$\{MAP_SURFACE_SIZE_PX\}px`/.test(source),
  },
  {
    name: 'Map surface uses border-box sizing',
    pass: /boxSizing: 'border-box'/.test(source),
  },
  {
    name: 'Map backing plane is exactly 8 by 8',
    pass: /<planeGeometry args=\{\[8, 8\]\} \/>/.test(mapFloorBlock),
  },
  {
    name: 'Map Html keeps distanceFactor 10',
    pass: /distanceFactor=\{10\}/.test(source),
  },
  {
    name: 'Map stays centered for origin-corner alignment',
    pass: /position=\{\[4, height - 0\.15, 4\]\}/.test(source),
  },
]

const failed = checks.filter((check) => !check.pass)

for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}`)
}

if (failed.length > 0) {
  process.exitCode = 1
}
