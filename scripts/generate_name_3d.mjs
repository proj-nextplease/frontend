import fs from 'fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Polyfill FileReader for Node.js GLTFExporter
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
};

const candidateName = process.argv[2] || "TÀI PHÁT";
console.log(`Generating 3D model for: "${candidateName}"`);

const fontData = JSON.parse(fs.readFileSync("public/universe-clone/assets/fonts/rounded_bold.typeface.json", "utf8"));
const loader = new FontLoader();
const font = loader.parse(fontData);

// Create TextGeometry with luxurious rounded bevels matching Fonlio 3D style
const textGeo = new TextGeometry(candidateName, {
  font: font,
  size: 1.0,
  depth: 0.26,
  curveSegments: 8,
  bevelEnabled: true,
  bevelThickness: 0.042,
  bevelSize: 0.032,
  bevelOffset: 0,
  bevelSegments: 4
});

textGeo.computeBoundingBox();
const bb = textGeo.boundingBox;
const rawW = bb.max.x - bb.min.x;
const rawH = bb.max.y - bb.min.y;

// Normalize size to match the original Fonlio logo width (~2.6 units)
const targetWidth = 2.8;
const scale = targetWidth / rawW;
textGeo.scale(scale, scale, scale);

// Center the geometry around (0, 0, 0)
textGeo.center();
textGeo.computeVertexNormals();

const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1.0,
  roughness: 0.38,
  envMapIntensity: 1.5
});

const mesh = new THREE.Mesh(textGeo, material);
mesh.name = "Candidate_Name_3D";

const scene = new THREE.Scene();
scene.add(mesh);

const box = new THREE.Box3().setFromObject(mesh);
console.log("3D Name Mesh bounds:", box.getSize(new THREE.Vector3()));

const exporter = new GLTFExporter();
const gltf = await exporter.parseAsync(scene, { binary: true });
const glbBuffer = Buffer.from(gltf);

// Write to both paths used by waitlist and universe
fs.writeFileSync('public/waitlist-clone/home/hero/logo-ximitech.glb', glbBuffer);
fs.writeFileSync('public/universe-clone/home/hero/logo-ximitech.glb', glbBuffer);
fs.writeFileSync('public/universe-clone/home/hero/logo-candidate.glb', glbBuffer);

console.log(`Successfully generated 3D candidate name GLB (${glbBuffer.length} bytes)!`);
