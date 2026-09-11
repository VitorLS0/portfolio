import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Preload, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Box3, MathUtils, NeutralToneMapping, Vector3 } from 'three'
import type { Group } from 'three'

// Last known cursor position in viewport pixels, shared by every model.
const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
window.addEventListener(
  'pointermove',
  (event) => {
    cursor.x = event.clientX
    cursor.y = event.clientY
  },
  { passive: true },
)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// Radians the model can turn toward the cursor, and the pose it holds
// instead when motion is reduced.
const MAX_TURN = { x: 0.6, y: 0.9 }
const REST = { x: 0.2, y: -0.35 }

function Model({ url, onReady }: { url: string; onReady: () => void }) {
  const { scene } = useGLTF(url)
  const turn = useRef<Group>(null)

  // Models arrive in arbitrary units and origins: centre the bounds and scale
  // the longest side to 2 world units so any file fits the same camera.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    return {
      scale: 2 / Math.max(size.x, size.y, size.z),
      offset: box.getCenter(new Vector3()).negate(),
    }
  }, [scene])

  useEffect(onReady, [onReady])

  useFrame(({ gl }, delta) => {
    const group = turn.current
    if (!group) return

    let x = REST.x
    let y = REST.y
    if (!reducedMotion.matches) {
      // Direction from the model's on-screen centre to the cursor, as a
      // fraction of half the viewport.
      const rect = gl.domElement.getBoundingClientRect()
      const dx = (cursor.x - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
      const dy = (cursor.y - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
      y = MathUtils.clamp(dx, -1, 1) * MAX_TURN.y
      x = MathUtils.clamp(dy, -1, 1) * MAX_TURN.x
    }
    group.rotation.x = MathUtils.damp(group.rotation.x, x, 6, delta)
    group.rotation.y = MathUtils.damp(group.rotation.y, y, 6, delta)
  })

  // The offset and scale live on wrapper groups, never on the cached scene
  // itself, so re-measuring it on the next mount stays correct.
  return (
    <group ref={turn}>
      <group scale={fit.scale}>
        <group position={fit.offset}>
          <primitive object={scene} dispose={null} />
        </group>
      </group>
    </group>
  )
}

type Props = {
  url: string
  /** Every model the page can show, fetched up front so switching never waits. */
  preload: string[]
  live: boolean
}

export default function RowObject({ url, preload, live }: Props) {
  const [ready, setReady] = useState(false)
  const markReady = useMemo(() => () => setReady(true), [])

  useEffect(() => {
    for (const model of preload) useGLTF.preload(model)
  }, [preload])

  return (
    <>
      {!ready && <span className="work__placeholder">3D</span>}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 35 }}
        dpr={[1, 2]}
        frameloop={live ? 'always' : 'demand'}
        // Measure layout size, not the on-screen box: the parent's scale()
        // transition would otherwise be baked into the canvas size.
        resize={{ offsetSize: true }}
        // R3F sets pointer-events: auto on its wrapper; the model is purely
        // decorative and, once faded out, must not block the row below.
        style={{ pointerEvents: 'none' }}
        // Neutral keeps the printed artwork's colours close to the source.
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={1.5} />
        {/* Built from lightformers, so no HDR file is fetched. */}
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[0, 3, 3]} scale={[6, 1, 1]} />
          <Lightformer intensity={1} position={[-4, 0, 2]} scale={[1, 4, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Model url={url} onReady={markReady} />
          {/* Compile shaders and upload textures now, not on first hover. */}
          <Preload all />
        </Suspense>
      </Canvas>
    </>
  )
}
