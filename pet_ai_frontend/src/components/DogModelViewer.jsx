// models/bowie_animatedtextures.fbx
import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const DogModelViewer = ({ onLoad }) => {
  const mountRef = useRef(null);
  const mixerRef = useRef(null);
  const sceneRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x808080);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(2, 2, 2);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    // Load FBX
    const loader = new FBXLoader();
    loader.load(
      '/models/bowie_animatedtextures.fbx',
      (fbx) => {
        fbx.scale.setScalar(1.0);
        
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        fbx.position.x = -center.x;
        fbx.position.z = -center.z;
        fbx.position.y = -box.min.y;
        
        // Create mixer
        const mixer = new THREE.AnimationMixer(fbx);
        mixerRef.current = mixer;
        
        // Collect bones
        const bones = {};
        fbx.traverse((child) => {
          if (child.isBone) {
            bones[child.name] = child;
          }
        });

        scene.add(fbx);

        camera.position.set(
          size.x * 2,
          size.y * 2,
          size.z * 2
        );
        camera.lookAt(new THREE.Vector3(0, size.y / 2, 0));
        controls.target.set(0, size.y / 2, 0);
        controls.update();

        // Call onLoad with bones and mixer
        if (onLoad) {
          onLoad(bones, mixer);
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error:', error);
      }
    );
    
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      mixerRef.current = null;
    };
  }, []); // Remove onLoad from dependencies

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default DogModelViewer;