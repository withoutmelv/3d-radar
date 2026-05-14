import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Html, Line, Grid, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as L from 'leaflet'

const RADAR_IMAGES = ['/radar1.png', '/radar2.png', '/radar3.png', '/radar4.png', '/radar5.png', '/radar6.png']
const MAP_SURFACE_SIZE_PX = 320

const LeafletMapSurface = ({ overlayUrl }: { overlayUrl: string }) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = mapRef.current
    if (!element) return

    const map = L.map(element, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      fadeAnimation: false,
    }).setView([23.3790, 113.7633], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(element)

    const frameId = requestAnimationFrame(() => {
      map.invalidateSize()
    })

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      map.remove()
    }
  }, [])

  return (
    <div
      style={{
        width: `${MAP_SURFACE_SIZE_PX}px`,
        height: `${MAP_SURFACE_SIZE_PX}px`,
        boxSizing: 'border-box',
        background: '#0b1424',
        border: '2px solid #1e2d45',
        borderRadius: '4px',
        overflow: 'hidden',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          filter: 'grayscale(100%) saturate(0%) contrast(0.9) brightness(0.92)',
        }}
      />
      <img
        src={overlayUrl}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          opacity: 0.7,
          pointerEvents: 'none',
          zIndex: 500,
        }}
      />
    </div>
  )
}

// 地图地板组件
const MapFloor = ({ height = 0, overlayUrl }: { height?: number; overlayUrl: string }) => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[4, height - 0.15, 4]}>
      {/* 底部衬垫，防止地图加载前的空洞 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color="#0b1424" />
      </mesh>

      <Html
        transform
        distanceFactor={10}
        occlude={false}
        // 强制设置大小，并开启 portal 确保不被 Canvas 裁剪
        portal={{ current: document.body }}
      >
        <LeafletMapSurface overlayUrl={overlayUrl} />
      </Html>
    </group>
  )
}

// 坐标轴组件
const CoordinateSystem = ({ visible = true }: { visible?: boolean }) => {
  if (!visible) return null
  return (
    <group>
      <Grid 
        infiniteGrid 
        fadeDistance={30} 
        fadeStrength={3} 
        cellSize={1} 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#1e2d45" 
        cellColor="#121a2b"
        position={[4, 0, 4]}
      />
      {/* Z轴 - 蓝色 (垂直轴) */}
      <Line
        points={[[0, 0, 0], [0, 12, 0]]}
        color="#4d4dff"
        lineWidth={2}
      />
      <Text position={[0, 12.5, 0]} fontSize={0.5} color="#4d4dff">
        Z
      </Text>

      {/* X轴 - 红色 */}
      <Line
        points={[[0, 0, 0], [10, 0, 0]]}
        color="#ff4d4d"
        lineWidth={2}
      />
      <Text position={[10.5, 0, 0]} fontSize={0.5} color="#ff4d4d">
        X
      </Text>

      {/* Y轴 - 绿色 */}
      <Line
        points={[[0, 0, 0], [0, 0, 10]]}
        color="#4dff4d"
        lineWidth={2}
      />
      <Text position={[0, 0, 10.5]} fontSize={0.5} color="#4dff4d">
        Y
      </Text>

      {/* 刻度标注 */}
      {[0, 1, 2, 3, 4, 5, 6].map((val) => (
        <group key={val}>
          <Text position={[-1, val * 2, 0]} fontSize={0.3} color="white" anchorX="right">
            {val} km
          </Text>
          {/* 辅助水平面网格线 */}
          <Line
            points={[[0, val * 2, 0], [8, val * 2, 0]]}
            color="white"
            transparent
            opacity={0.1}
            dashed
          />
          <Line
            points={[[0, val * 2, 0], [0, val * 2, 8]]}
            color="white"
            transparent
            opacity={0.1}
            dashed
          />
        </group>
      ))}
    </group>
  )
}

// 雷达图层组件
const RadarPlane = ({ 
  url, 
  position, 
  isSelected, 
  isHidden,
  onClick 
}: { 
  url: string; 
  position: [number, number, number]; 
  isSelected: boolean;
  isHidden: boolean;
  onClick: () => void;
}) => {
  const texture = useTexture(url)
  const meshRef = useRef<THREE.Mesh>(null)

  // 鼠标悬停状态
  const [hovered, setHover] = useState(false)
  
  const opacity = isSelected ? 1 : isHidden ? 0.5 : hovered ? 0.9 : 0.7

  return (
    <mesh 
      ref={meshRef}
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => {
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial 
        map={texture} 
        transparent={true} 
        opacity={opacity} 
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={true} // 显式开启深度测试
      />
      {/* 选中高亮边框 */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(8, 8)]} />
          <lineBasicMaterial color="#00ffff" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  )
}

const SceneContent = ({ 
  selectedLayer, 
  setSelectedLayer 
}: { 
  selectedLayer: number | null, 
  setSelectedLayer: (id: number | null) => void 
}) => {
  const { camera, controls } = useThree()
  const images = RADAR_IMAGES
  const mapHeight = selectedLayer === null ? 0 : selectedLayer * 2
  const mapOverlayUrl = selectedLayer === null ? images[0] : images[selectedLayer]
  
  const handleLayerClick = (index: number) => {
    if (selectedLayer === index) {
      setSelectedLayer(null)
    } else {
      setSelectedLayer(index)
    }
  }

  useEffect(() => {
    if (selectedLayer !== null) {
      focusCamera(selectedLayer)
    } else {
      resetCamera()
    }
  }, [selectedLayer])

  const focusCamera = (index: number) => {
    const targetY = index * 2 - 5 // 调整后的高度，去掉了 +1
    
    if (controls) {
      const orbit = controls as any
      
      gsap.to(camera.position, {
        x: 10,
        y: targetY + 8,
        z: 10,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(orbit.target)
      })

      gsap.to(orbit.target, {
        x: 0,
        y: targetY,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut'
      })
    }
  }

  const resetCamera = () => {
    if (controls) {
      const orbit = controls as any
      
      gsap.to(camera.position, {
        x: 18,
        y: 12,
        z: 18,
        duration: 1.2,
        ease: 'power2.inOut'
      })

      gsap.to(orbit.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut'
      })
    }
  }

  return (
    <group position={[-4, -5, -4]}>
      <MapFloor height={mapHeight} overlayUrl={mapOverlayUrl} />
      <CoordinateSystem visible={selectedLayer === null} />
      <group>
        {images.map((url, index) => (
          <RadarPlane 
            key={url} 
            url={url} 
            position={[4, index === 0 ? 0.02 : index * 2, 4]}
            isSelected={selectedLayer === index}
            isHidden={selectedLayer !== null && selectedLayer !== index}
            onClick={() => handleLayerClick(index)}
          />
        ))}
      </group>
    </group>
  )
}

const LayerControls = ({
  selectedLayer,
  setSelectedLayer
}: {
  selectedLayer: number | null
  setSelectedLayer: (id: number | null) => void
}) => {
  const buttonStyle = (active: boolean) => ({
    padding: '8px 16px',
    background: active ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
    border: active ? '1px solid #00ffff' : '1px solid rgba(255, 255, 255, 0.1)',
    color: active ? '#00ffff' : '#ffffff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'sans-serif'
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        background: 'rgba(11, 20, 36, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      }}
    >
      <span style={{ color: '#ffffff', fontSize: '12px', fontFamily: 'sans-serif' }}>高度层级</span>
      <button
        type="button"
        aria-pressed={selectedLayer === null}
        onClick={() => setSelectedLayer(null)}
        style={buttonStyle(selectedLayer === null)}
      >
        全览
      </button>
      {RADAR_IMAGES.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-pressed={selectedLayer === index}
          onClick={() => setSelectedLayer(index)}
          style={buttonStyle(selectedLayer === index)}
        >
          {index} km
        </button>
      ))}
    </div>
  )
}

function App() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null)

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0b1424', position: 'relative' }}>
      {/* 图例叠加层 */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '40px',
        zIndex: 10,
        padding: '15px',
        background: 'rgba(11, 20, 36, 0.8)',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '12px',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '14px' }}>反射率(dBZ)</div>
        <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
          {[
            { color: '#700000', label: '70' },
            { color: '#ff0000', label: '60' },
            { color: '#ff8000', label: '50' },
            { color: '#ffff00', label: '40' },
            { color: '#00ff00', label: '30' },
            { color: '#00ffff', label: '20' },
            { color: '#0080ff', label: '10' },
            { color: '#0000ff', label: '0' },
            { color: '#000080', label: '-10' },
            { color: '#404040', label: '-20' },
            { color: '#202020', label: '-30' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
              <div style={{ width: '15px', height: '10px', background: item.color, marginRight: '8px' }}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <LayerControls selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />

      <Canvas shadows>
        <Suspense fallback={<Html center><div style={{ color: 'white' }}>加载中...</div></Html>}>
          <PerspectiveCamera makeDefault position={[18, 12, 18]} fov={45} />
          <OrbitControls makeDefault />
          
          <ambientLight intensity={1} />
          
          <SceneContent selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />

          {/* 标题 */}
          <Html position={[0, 8, 0]} center>
            <div style={{ 
              color: 'white', 
              fontSize: '28px', 
              fontWeight: 'bold', 
              pointerEvents: 'none', 
              whiteSpace: 'nowrap',
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              fontFamily: 'sans-serif'
            }}>
              {selectedLayer !== null ? `高度 ${selectedLayer} km 详情` : '三维雷达反射率'}
            </div>
          </Html>
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
