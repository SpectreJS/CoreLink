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

const countryShapes = [
	{
		name: 'CHINE',
		color: 0x287bff,
		polygons: [
			[
				[127.66, 49.76], [129.4, 49.44], [130.58, 48.73], [130.99, 47.79], [135.03, 48.48],
				[133.1, 45.14], [131.03, 44.97], [131.14, 42.93], [130.63, 42.9], [130.64, 42.4],
				[129.99, 42.99], [129.6, 42.42], [128.05, 41.99], [128.21, 41.47], [126.87, 41.82],
				[124.27, 39.93], [121.05, 38.9], [122.17, 40.42], [121.64, 40.95], [117.53, 38.74],
				[119.7, 37.16], [120.82, 37.87], [122.36, 37.45], [122.52, 36.93], [121.1, 36.65],
				[119.15, 34.91], [120.23, 34.36], [121.91, 31.69], [121.89, 30.95], [121.26, 30.68],
				[122.09, 29.83], [121.68, 28.23], [121.13, 28.14], [118.66, 24.55], [115.89, 22.78],
				[114.15, 22.22], [113.81, 22.55], [110.79, 21.4], [110.44, 20.34], [109.89, 20.28],
				[109.86, 21.4], [107.04, 21.81], [106.57, 22.22], [106.73, 22.79], [105.33, 23.35],
				[101.65, 22.32], [101.8, 21.17], [101.27, 21.2], [101.15, 21.85], [100.42, 21.56],
				[99.24, 22.12], [99.53, 22.95], [98.9, 23.14], [98.66, 24.06], [97.6, 23.9],
				[97.72, 25.08], [98.67, 25.92], [98.68, 27.51], [97.91, 28.34], [96.25, 28.41],
				[96.59, 28.83], [96.12, 29.45], [95.4, 29.03], [94.57, 29.28], [92.5, 27.9],
				[90.02, 28.3], [88.81, 27.3], [88.73, 28.09], [85.82, 28.2], [82.33, 30.12],
				[79.72, 30.88], [78.74, 31.52], [78.46, 32.62], [79.18, 32.48], [78.91, 34.32],
				[77.84, 35.49], [76.19, 35.9], [74.98, 37.42], [74.86, 38.38], [73.93, 38.51],
				[73.68, 39.43], [74.78, 40.37], [76.53, 40.43], [76.9, 41.07], [80.12, 42.12],
				[80.18, 42.92], [80.87, 43.18], [79.97, 44.92], [82.46, 45.54], [83.18, 47.33],
				[85.16, 47], [85.72, 47.45], [85.77, 48.46], [87.75, 49.3], [88.01, 48.6],
				[90.28, 47.69], [90.97, 46.89], [90.59, 45.72], [90.95, 45.29], [95.31, 44.24],
				[96.35, 42.73], [100.85, 42.66], [104.96, 41.6], [110.41, 42.87], [111.83, 43.74],
				[111.35, 44.46], [111.87, 45.1], [113.46, 44.81], [117.42, 46.67], [119.66, 46.69],
				[119.77, 47.05], [118.06, 48.07], [115.74, 47.73], [115.49, 48.14], [116.68, 49.89],
				[117.88, 49.51], [119.29, 50.14], [120.74, 51.96], [120.73, 52.52], [120.18, 52.75],
				[121, 53.25], [123.57, 53.46], [125.95, 52.79], [127.66, 49.76],
			],
			[
				[110.34, 18.68], [109.48, 18.2], [108.66, 18.51], [108.63, 19.37],
				[110.79, 20.08], [111.01, 19.7], [110.34, 18.68],
			],
		],
	},
	{
		name: 'MADAGASCAR',
		color: 0x16a673,
		polygons: [[
			[49.54, -12.47], [49.81, -12.9], [50.06, -13.56], [50.22, -14.76], [50.48, -15.23],
			[50.38, -15.71], [50.2, -16], [49.86, -15.41], [49.67, -15.71], [49.86, -16.45],
			[49.77, -16.88], [49.5, -17.11], [49.44, -17.95], [49.04, -19.12], [48.55, -20.5],
			[47.93, -22.39], [47.55, -23.78], [47.1, -24.94], [46.28, -25.18], [45.41, -25.6],
			[44.83, -25.35], [44.04, -24.99], [43.76, -24.46], [43.7, -23.57], [43.35, -22.78],
			[43.25, -22.06], [43.43, -21.34], [43.89, -21.16], [43.9, -20.83], [44.37, -20.07],
			[44.46, -19.44], [44.23, -18.96], [44.04, -18.33], [43.96, -17.41], [44.31, -16.85],
			[44.45, -16.22], [44.94, -16.18], [45.5, -15.97], [45.87, -15.79], [46.31, -15.78],
			[46.88, -15.21], [47.71, -14.59], [48.01, -14.09], [47.87, -13.66], [48.29, -13.78],
			[48.85, -13.09], [48.86, -12.49], [49.19, -12.04], [49.54, -12.47],
		]],
	},
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

function addCountryShape(worldGroup, country) {
	country.polygons.forEach((coordinates) => {
		const shape = new THREE.Shape();
		coordinates.forEach(([lon, lat], index) => {
			if (index === 0) shape.moveTo(lon, lat);
			else shape.lineTo(lon, lat);
		});
		shape.closePath();

		const flatGeometry = new THREE.ShapeGeometry(shape);
		const flatPositions = flatGeometry.getAttribute('position');
		const flatIndices = flatGeometry.getIndex();
		const vertices = Array.from({ length: flatPositions.count }, (_, index) => [
			flatPositions.getX(index),
			flatPositions.getY(index),
		]);
		let triangles = [];
		for (let index = 0; index < (flatIndices?.count ?? flatPositions.count); index += 3) {
			triangles.push([
				flatIndices ? flatIndices.getX(index) : index,
				flatIndices ? flatIndices.getX(index + 1) : index + 1,
				flatIndices ? flatIndices.getX(index + 2) : index + 2,
			]);
		}

		for (let level = 0; level < 2; level += 1) {
			triangles = triangles.flatMap(([a, b, c]) => {
				const midpoint = (first, second) => [
					(vertices[first][0] + vertices[second][0]) / 2,
					(vertices[first][1] + vertices[second][1]) / 2,
				];
				const ab = midpoint(a, b);
				const bc = midpoint(b, c);
				const ca = midpoint(c, a);
				const start = vertices.length;
				vertices.push(ab, bc, ca);
				return [
					[a, start, start + 2],
					[start, b, start + 1],
					[start + 2, start + 1, c],
					[start, start + 1, start + 2],
				];
			});
		}

		const projectedPositions = new Float32Array(triangles.length * 9);
		const projectedIndices = new Uint32Array(triangles.length * 3);
		triangles.forEach((triangle, triangleIndex) => {
			triangle.forEach((vertexIndex, cornerIndex) => {
				const position = latLongToVector3(
					vertices[vertexIndex][1],
					vertices[vertexIndex][0],
					76,
				);
				const positionIndex = triangleIndex * 3 + cornerIndex;
				projectedPositions.set([position.x, position.y, position.z], positionIndex * 3);
				projectedIndices[positionIndex] = positionIndex;
			});
		});
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(projectedPositions, 3));
		geometry.setIndex(new THREE.BufferAttribute(projectedIndices, 1));
		geometry.computeVertexNormals();
		flatGeometry.dispose();

		worldGroup.add(new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({
				color: country.color,
				transparent: true,
				opacity: 0.72,
				side: THREE.DoubleSide,
				depthWrite: false,
			}),
		));

		const borderPoints = coordinates.map(([lon, lat]) => latLongToVector3(lat, lon, 76.15));
		borderPoints.push(borderPoints[0]);
		worldGroup.add(new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(borderPoints),
			new THREE.LineBasicMaterial({ color: country.color, transparent: true, opacity: 0.95 }),
		));
	});
}

function createVehicle(color, isAircraft) {
	const group = new THREE.Group();
	const points = isAircraft
		? [[0, 1.15], [-0.16, 0.15], [-1, -0.2], [-1, -0.42], [-0.14, -0.28], [-0.12, -0.9], [-0.38, -1.05], [-0.38, -1.2], [0, -1.08], [0.38, -1.2], [0.38, -1.05], [0.12, -0.9], [0.14, -0.28], [1, -0.42], [1, -0.2], [0.16, 0.15]]
		: [[-0.8, -0.45], [0.8, -0.45], [0.52, -0.05], [0.25, 0.5], [0, 0.95], [-0.25, 0.5], [-0.52, -0.05]];
	const shape = new THREE.Shape();
	points.forEach(([x, y], index) => {
		if (index === 0) shape.moveTo(x, y);
		else shape.lineTo(x, y);
	});
	shape.closePath();

	const body = new THREE.Mesh(
		new THREE.ShapeGeometry(shape),
		new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
	);
	group.add(body);

	if (!isAircraft) {
		const cabin = new THREE.Mesh(
			new THREE.BoxGeometry(0.42, 0.34, 0.12),
			new THREE.MeshBasicMaterial({ color: 0xffffff }),
		);
		cabin.position.set(0, 0.05, 0.04);
		group.add(cabin);
	}

	group.scale.setScalar(isAircraft ? 2.2 : 1.7);
	return group;
}

function createCountryLabel(name, color) {
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 64;
	const context = canvas.getContext('2d');
	if (!context) return null;

	context.fillStyle = 'rgba(7, 20, 38, 0.9)';
	context.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
	context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
	context.lineWidth = 3;
	context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
	context.fillStyle = '#ffffff';
	context.font = '600 27px sans-serif';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(name, canvas.width / 2, canvas.height / 2);

	const texture = new THREE.CanvasTexture(canvas);
	const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
		map: texture,
		transparent: true,
		depthTest: true,
		depthWrite: false,
	}));
	sprite.scale.set(name === 'CHINE' ? 25 : 20, name === 'CHINE' ? 6.25 : 5, 1);
	return sprite;
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

		countryShapes.forEach((country) => addCountryShape(worldGroup, country));
		countryShapes.forEach((country) => {
			const label = createCountryLabel(country.name, country.color);
			if (!label) return;
			const location = country.name === 'CHINE'
				? { lat: 30, lon: 140 }
				: { lat: -20, lon: 58 };
			label.position.copy(latLongToVector3(location.lat, location.lon, 79));
			worldGroup.add(label);
		});

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

		const createArc = (from, to, color, peakElevation, radius = 76.5) => {
			const start = latLongToVector3(from.lat, from.lon, radius);
			const finish = latLongToVector3(to.lat, to.lon, radius);
			const middle = new THREE.Vector3().addVectors(start, finish).multiplyScalar(0.5);
			middle.normalize().multiplyScalar(radius + start.distanceTo(finish) * 0.25 + peakElevation);
			const curve = new THREE.QuadraticBezierCurve3(start, middle, finish);
			const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
			const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
			worldGroup.add(new THREE.Line(geometry, material));
			return curve;
		};

		const aircraftRoute = createArc(hubs[0], hubs[2], 0x56d9f5, 18, 78);
		createArc(hubs[0], hubs[5], 0x287bff, 12);
		createArc(hubs[5], hubs[2], 0x56d9f5, 15);

		const seaRoutePoints = [
			{ lat: 23.13, lon: 113.26 },
			{ lat: 1.35, lon: 103.82 },
			{ lat: -12, lon: 78 },
			{ lat: -18.15, lon: 49.4 },
		].map(({ lat, lon }) => latLongToVector3(lat, lon, 77.5));
		const seaRoute = new THREE.CatmullRomCurve3(seaRoutePoints);
		const seaRouteLine = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(seaRoute.getPoints(90)),
			new THREE.LineDashedMaterial({
				color: 0x16a673,
				transparent: true,
				opacity: 0.75,
				dashSize: 2,
				gapSize: 1.5,
			}),
		);
		seaRouteLine.computeLineDistances();
		worldGroup.add(seaRouteLine);

		const aircraft = createVehicle(0xffffff, true);
		const shipOne = createVehicle(0x56d9f5, false);
		const shipTwo = createVehicle(0x16a673, false);
		worldGroup.add(aircraft, shipOne, shipTwo);

		const placeVehicle = (vehicle, curve, progress) => {
			const position = curve.getPointAt(progress);
			const tangent = curve.getTangentAt(progress).normalize();
			const normal = position.clone().normalize();
			const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();
			const forward = new THREE.Vector3().crossVectors(normal, right).normalize();
			vehicle.position.copy(position);
			vehicle.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, forward, normal));
		};

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

		worldGroup.rotation.set(0.12, 3.44, 0);
		let targetRotationX = 0.12;
		let targetRotationY = 3.44;
		let isVisible = true;
		let animationFrame;

		const resize = () => {
			const { width, height } = container.getBoundingClientRect();
			if (!width || !height) return;
			camera.aspect = width / height;
			camera.position.z = 215 / Math.min(1, camera.aspect);
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};
		const onMouseMove = (event) => {
			const normX = (event.clientX / window.innerWidth) * 2 - 1;
			const normY = -(event.clientY / window.innerHeight) * 2 + 1;
			targetRotationY = 3.44 + normX * 0.45;
			targetRotationX = 0.12 - normY * 0.35;
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
			worldGroup.rotation.y += 0.00035;
			worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.04;
			worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.04;
			const time = performance.now() * 0.00008;
			placeVehicle(aircraft, aircraftRoute, (time % 1));
			placeVehicle(shipOne, seaRoute, (time * 0.22) % 1);
			placeVehicle(shipTwo, seaRoute, (time * 0.22 + 0.5) % 1);
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
					materials.forEach((material) => {
						material.map?.dispose();
						material.dispose();
					});
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
