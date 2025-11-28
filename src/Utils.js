import * as THREE from 'three';

export function sanitizeMaterial(old) {
  if (!old) return new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  let baseMap = old.map || null;
  const forbidden = ['normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'];
  forbidden.forEach(key => { if (old[key] && old[key].dispose) old[key].dispose(); });

  return new THREE.MeshStandardMaterial({
    map: baseMap,
    color: old.color ? old.color.clone() : new THREE.Color(0xffffff),
    roughness: 1.0,
    metalness: 0.0,
    transparent: old.transparent,
    opacity: old.opacity,
    alphaTest: old.alphaTest || 0.5, 
    side: THREE.DoubleSide 
  });
}