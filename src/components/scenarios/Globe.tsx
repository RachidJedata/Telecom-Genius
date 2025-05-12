"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Color } from "three"

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isHighResLoaded, setIsHighResLoaded] = useState(false)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene, camera, renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Starfield
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })
    )
    scene.add(stars)

    // Atmosphere glow
    const atmosphereVertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    const atmosphereFragmentShader = `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(glowColor, 1.0) * intensity;
      }
    `
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 32, 32),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        uniforms: { glowColor: { value: new Color(0x3a86ff) } },
      })
    )
    scene.add(atmosphere)

    // Wireframe globe
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x3a86ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })
    const wireframeGlobe = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), wireframeMaterial)
    scene.add(wireframeGlobe)

    // Solid globe
    const solidGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(4.9, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x1a237e, transparent: true, opacity: 0 })
    )
    scene.add(solidGlobe)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    camera.position.z = 10

    // Dynamic import of OrbitControls
    let controls: any = null
    import('three/examples/jsm/controls/OrbitControls.js')
      .then(({ OrbitControls }) => {
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.rotateSpeed = 0.5
        controls.enableZoom = false
      })
    // .catch(console.error)

    // Color transition setup
    const colors = [
      new Color(0x3a86ff),
      new Color(0x8338ec),
      new Color(0xff006e),
      new Color(0xfb5607),
      new Color(0xffbe0b),
    ]
    let colorIndex = 0
    let nextColorIndex = 1
    let colorT = 0
    const colorTransitionSpeed = 0.005
    const lerpColor = (a: Color, b: Color, t: number) =>
      new Color(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t)

    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // update colors
      colorT += colorTransitionSpeed
      if (colorT >= 1) {
        colorT = 0
        colorIndex = nextColorIndex
        nextColorIndex = (nextColorIndex + 1) % colors.length
      }
      const currentColor = lerpColor(colors[colorIndex], colors[nextColorIndex], colorT)
        ; (wireframeMaterial).color = currentColor
        ; (solidGlobe.material as THREE.MeshPhongMaterial).color = currentColor
        ; (atmosphere.material as THREE.ShaderMaterial).uniforms.glowColor.value = currentColor

      // rotation
      wireframeGlobe.rotation.y += 0.001
      solidGlobe.rotation.y += 0.001
      atmosphere.rotation.y += 0.0005
      stars.rotation.y += 0.0001

      // update controls if ready
      if (controls) controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // High-res textures
    // const loader = new THREE.TextureLoader()
    // Promise.all([
    //   loader.loadAsync('/earth-texture-compressed.jpg'),
    //   loader.loadAsync('/earth-bump-compressed.jpg'),
    //   loader.loadAsync('/earth-specular-compressed.jpg'),
    // ]).then(([tex, bump, spec]) => {
    //   const highResMat = new THREE.MeshPhongMaterial({
    //     map: tex,
    //     bumpMap: bump,
    //     bumpScale: 0.05,
    //     specularMap: spec,
    //     specular: new THREE.Color('grey'),
    //   })
    //   const start = Date.now()
    //   const duration = 1000
    //   const transition = () => {
    //     const progress = Math.min((Date.now() - start) / duration, 1)
    //     solidGlobe.material = highResMat,
    //       (solidGlobe.material as THREE.MeshPhongMaterial).opacity = progress
    //     wireframeMaterial.opacity = 0.5 * (1 - progress)
    //     if (progress < 1) requestAnimationFrame(transition)
    //     else {
    //       setIsHighResLoaded(true)
    //       scene.remove(wireframeGlobe)
    //     }
    //     renderer.render(scene, camera)
    //   }
    //   transition()
    // })

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // hint
    const hintTimer = setTimeout(() => setShowHint(false), 3000)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animationId)
      if (controls) controls.dispose()
      container.removeChild(renderer.domElement)
      clearTimeout(hintTimer)
    }
  }, [])

  return (
    <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0">
      {showHint && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100">
          Glissez pour explorer
        </div>
      )}
    </div>
  )
}
