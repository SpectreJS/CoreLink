import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const hubs = [
  { name: 'Guangzhou', lat: 23.13, lon: 113.26, primary: true },
  { name: 'Yiwu', lat: 29.31, lon: 120.08, primary: true },
  { name: 'Antananarivo', lat: -18.88, lon: 47.51, primary: true },
  { name: 'Toamasina', lat: -18.15, lon: 49.4, primary: true },
  { name: 'Dubai', lat: 25.2, lon: 55.27, primary: false },
  { name: 'Singapore', lat: 1.35, lon: 103.82, primary: false },
];

function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export default function Globe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 240;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      container.dataset.renderer = 'fallback';
      console.warn('Le globe animé est désactivé : WebGL est indisponible dans ce navigateur.', error);
      return () => {
        delete container.dataset.renderer;
      };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(75, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x071426, transparent: true, opacity: 0.92 }),
    );
    worldGroup.add(sphere);

    const wireLines = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(75.5, 24, 20)),
      new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.4 }),
    );
    worldGroup.add(wireLines);

    hubs.forEach((hub) => {
      const position = latLongToVector3(hub.lat, hub.lon, 76.5);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(hub.primary ? 2.2 : 1.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: hub.primary ? 0x56d9f5 : 0x287bff }),
      );
      dot.position.copy(position);
      worldGroup.add(dot);

      if (hub.primary) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(2.8, 3.8, 20),
          new THREE.MeshBasicMaterial({
            color: 0x56d9f5,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
          }),
        );
        ring.position.copy(position);
        ring.lookAt(0, 0, 0);
        worldGroup.add(ring);
      }
    });

    const createArc = (from, to, color, peakElevation) => {
      const start = latLongToVector3(from.lat, from.lon, 76.5);
      const finish = latLongToVector3(to.lat, to.lon, 76.5);
      const middle = new THREE.Vector3().addVectors(start, finish).multiplyScalar(0.5);
      middle.normalize().multiplyScalar(76.5 + start.distanceTo(finish) * 0.25 + peakElevation);
      const curve = new THREE.QuadraticBezierCurve3(start, middle, finish);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
      worldGroup.add(new THREE.Line(geometry, material));
    };

    createArc(hubs[0], hubs[2], 0x56d9f5, 18);
    createArc(hubs[1], hubs[3], 0x287bff, 22);
    createArc(hubs[0], hubs[5], 0x287bff, 12);
    createArc(hubs[5], hubs[2], 0x56d9f5, 15);

    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particlePositions.length; i += 3) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 77 + Math.random() * 26;
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    worldGroup.add(new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x56d9f5, size: 1.5, transparent: true, opacity: 0.5 }),
    ));

    worldGroup.rotation.set(0.22, -1.1, 0);
    let targetRotationX = 0.22;
    let targetRotationY = -1.1;
    let isVisible = true;
    let animationFrame;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const onMouseMove = (event) => {
      const normX = (event.clientX / window.innerWidth) * 2 - 1;
      const normY = -(event.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = -1.1 + normX * 0.45;
      targetRotationX = 0.22 - normY * 0.35;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    intersectionObserver.observe(container);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      if (!isVisible) return;
      worldGroup.rotation.y += 0.002;
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.04;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.04;
      renderer.render(scene, camera);
    };
    resize();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className="hero-globe-mount w-full h-[420px] sm:h-[480px] lg:h-[520px] relative z-10 flex items-center justify-center cursor-grab active:cursor-grabbing"
      id="hero-globe-container"
      ref={containerRef}
      role="img"
      aria-label="Globe animé illustrant les routes de fret entre la Chine et Madagascar"
    >
      <div className="globe-fallback" />
    </div>
  );
}
