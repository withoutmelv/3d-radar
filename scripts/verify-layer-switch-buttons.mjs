import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const checks = [
  {
    name: 'RADAR_IMAGES is a top-level shared constant',
    pass: /const RADAR_IMAGES = \['\/radar1\.png'[\s\S]*?'\/radar6\.png'\]/.test(source),
  },
  {
    name: 'LayerControls component exists',
    pass: /const LayerControls = \(\{\s*selectedLayer,\s*setSelectedLayer\s*\}/s.test(source),
  },
  {
    name: 'LayerControls includes overview button',
    pass: /setSelectedLayer\(null\)[\s\S]*全览/.test(source),
  },
  {
    name: 'LayerControls renders km buttons from RADAR_IMAGES',
    pass: /RADAR_IMAGES\.map\(\(_, index\)/.test(source) && /\{index\} km/.test(source),
  },
  {
    name: 'App renders LayerControls',
    pass: /<LayerControls selectedLayer=\{selectedLayer\} setSelectedLayer=\{setSelectedLayer\} \/>/.test(source),
  },
  {
    name: 'SceneContent uses RADAR_IMAGES',
    pass: /const images = RADAR_IMAGES/.test(source),
  },
]

const failed = checks.filter((check) => !check.pass)

for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}`)
}

if (failed.length > 0) {
  process.exitCode = 1
}
