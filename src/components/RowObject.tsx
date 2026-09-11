import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Preload, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  BackSide,
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import type { Group, Object3D } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ModelStyle } from '../content'
import { settings } from '../site.config'

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

// ── Outline style ──────────────────────────────────────────────────────────
// A cartoon look: flat black, an even ink line around the silhouette, and
// thinner lines along only the sharpest creases. No shading at all.

// Silhouette line width in CSS pixels, the same at any model size.
const OUTLINE_WIDTH = 2.5
// Faces meeting at more than this many degrees get a crease line. Lower it
// for more interior detail, raise it for a flatter, cleaner look.
const EDGE_ANGLE = 50

const outlineColor = new Color(settings.outlineColor)

// Hides whatever is behind it. Polygon offset nudges it back so the crease
// lines drawn on its surface always win the depth test.
const fillMaterial = new MeshBasicMaterial({
  color: 0x000000,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
})

const lineMaterial = new LineBasicMaterial({ color: outlineColor, toneMapped: false })

// "Inverted hull": the model's back faces, pushed outward along their
// normals in screen space, peek out around the black fill as an ink line.
// Model.useFrame keeps uViewport in sync with the canvas size.
const hullMaterial = new ShaderMaterial({
  side: BackSide,
  toneMapped: false,
  uniforms: {
    uColor: { value: outlineColor },
    uWidth: { value: OUTLINE_WIDTH },
    uViewport: { value: new Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    uniform float uWidth;
    uniform vec2 uViewport;
    void main() {
      vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec2 dir = (projectionMatrix * vec4(normalMatrix * normal, 0.0)).xy;
      float len = length(dir);
      // Pixels → clip space: 2 / viewport per pixel, scaled by w to undo
      // the perspective divide.
      if (len > 0.0) clip.xy += dir / len * uWidth * 2.0 / uViewport * clip.w;
      gl_Position = clip;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
      #include <colorspace_fragment>
    }
  `,
})

// The hull needs one averaged normal per corner, or it splits open along
// hard edges. Copies the positions as plain floats (the source may be
// quantized or interleaved), welds shared corners and recomputes normals.
function hullGeometry(source: BufferGeometry) {
  const position = source.getAttribute('position')
  const floats = new Float32Array(position.count * 3)
  for (let i = 0; i < position.count; i++) {
    floats[i * 3] = position.getX(i)
    floats[i * 3 + 1] = position.getY(i)
    floats[i * 3 + 2] = position.getZ(i)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(floats, 3))
  if (source.index) geometry.setIndex(source.index)

  // Weld tolerance relative to the mesh's size, since glTF units vary.
  geometry.computeBoundingBox()
  const extent = geometry.boundingBox!.getSize(new Vector3()).length()
  const welded = mergeVertices(geometry, extent * 1e-5)
  welded.computeVertexNormals()
  return welded
}

const outlined = new WeakMap<Object3D, Object3D>()

// A styled copy of a cached glTF scene, built once per model so switching
// rows never rebuilds it. The fill shares the original's geometry.
function outline(scene: Object3D) {
  const cached = outlined.get(scene)
  if (cached) return cached

  const copy = scene.clone()
  const meshes: Mesh[] = []
  copy.traverse((child) => {
    if (child instanceof Mesh) meshes.push(child)
  })
  for (const mesh of meshes) {
    mesh.material = fillMaterial
    mesh.add(new Mesh(hullGeometry(mesh.geometry), hullMaterial))
    mesh.add(new LineSegments(new EdgesGeometry(mesh.geometry, EDGE_ANGLE), lineMaterial))
  }
  outlined.set(scene, copy)
  return copy
}

type ModelProps = { url: string; style: ModelStyle; onReady: () => void }

function Model({ url, style, onReady }: ModelProps) {
  const { scene } = useGLTF(url)
  const object = useMemo(
    () => (style === 'outline' ? outline(scene) : scene),
    [scene, style],
  )
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

  useFrame(({ gl, size }, delta) => {
    hullMaterial.uniforms.uViewport.value.set(size.width, size.height)
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
          <primitive object={object} dispose={null} />
        </group>
      </group>
    </group>
  )
}

type Props = {
  url: string
  modelStyle: ModelStyle
  /** Every model the page can show, fetched up front so switching never waits. */
  preload: string[]
  live: boolean
}

export default function RowObject({ url, modelStyle, preload, live }: Props) {
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
        {/* Only "original" models use the lighting; the outline style is unlit. */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={1.5} />
        {/* Built from lightformers, so no HDR file is fetched. */}
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[0, 3, 3]} scale={[6, 1, 1]} />
          <Lightformer intensity={1} position={[-4, 0, 2]} scale={[1, 4, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Model url={url} style={modelStyle} onReady={markReady} />
          {/* Compile shaders and upload textures now, not on first hover. */}
          <Preload all />
        </Suspense>
      </Canvas>
    </>
  )
}
