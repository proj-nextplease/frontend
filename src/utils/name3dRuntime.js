import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let cachedFont = null;

export async function createCandidateNameMesh(name = "TÀI PHÁT", fontPath = "/universe-clone/assets/fonts/rounded_bold.typeface.json") {
  try {
    if (!cachedFont) {
      const loader = new FontLoader();
      cachedFont = await loader.loadAsync(fontPath);
    }
    
    const cleanName = (name || "TÀI PHÁT").trim().toUpperCase();
    
    const textGeo = new TextGeometry(cleanName, {
      font: cachedFont,
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
    
    // Target width around 2.8 units
    const targetWidth = 2.8;
    const scale = targetWidth / Math.max(0.1, rawW);
    textGeo.scale(scale, scale, scale);
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
    
    const group = new THREE.Group();
    group.add(mesh);
    return group;
  } catch (err) {
    console.warn("Unable to generate dynamic 3D text mesh, falling back to GLB:", err);
    return null;
  }
}
