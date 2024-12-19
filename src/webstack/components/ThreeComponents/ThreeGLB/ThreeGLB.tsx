import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import styles from "./ThreeGLB.scss";

interface GLBViewerProps {
  modelPath: string;
  wireframe?: boolean;
  wireframeColor?: string;
  fov?: number;
  width?: number | string;
  height?: number | string;
  animate?: boolean;
}

const GLBViewer: React.FC<GLBViewerProps> = ({
  width = 100,
  height = 100,
  modelPath,
  wireframe = false,
  wireframeColor = '#000000',
  fov = 100,
  animate = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 100, height: 100 });
  const [modelExists, setModelExists] = useState(true);
  const [currentModelPath, setCurrentModelPath] = useState(modelPath);

  const updateContainerSize = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setContainerSize({ width: offsetWidth, height: offsetHeight });
    }
  };

  useEffect(() => {
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  const checkModelPath = async (path: string) => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Model not found');
      }
      setModelExists(true);
      setCurrentModelPath(path);
    } catch (error) {
      setModelExists(false);
      setCurrentModelPath('/servers/frontend/Deepturn/app/public/merchant/nirv1/3dModels/products/MetalBox.glb');
    }
  };

  useEffect(() => {
    checkModelPath(modelPath);
  }, [modelPath]);

  const Model = () => {
    const gltf = useGLTF(currentModelPath);
    const modelRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useEffect(() => {
      if (modelRef.current && camera) {
        const box = new THREE.Box3().setFromObject(modelRef.current);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        modelRef.current.position.sub(center);

        const maxDimension = Math.max(size.x, size.y, size.z);
        const aspectRatio = containerSize.width / containerSize.height;
        camera.updateProjectionMatrix();

        const cameraDistance = maxDimension / (2 * Math.tan((fov * Math.PI) / 180 / 2));
        camera.position.set(-cameraDistance, -cameraDistance, cameraDistance + size.z);

        if (animate) {
          gsap.to(camera.position, {
            x: 0,
            y: 0,
            z: cameraDistance + size.z,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              camera.lookAt(0, 0, 0);
              camera.updateProjectionMatrix();
            },
          });
        } else {
          camera.position.set(0, 0, cameraDistance + size.z);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }
      }
    }, [gltf, camera, containerSize, animate]);

    return (
      <primitive
        object={gltf.scene}
        ref={modelRef}
        scale={1}
        position={[0, 0, 0]}
        // rotation={[0, 0, 0]}
      />
    );
  };

  return (
    <div ref={containerRef} style={{ width, height }}>
      <style jsx>{styles}</style>
      {modelExists ? (
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault fov={fov} position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <Environment preset="sunset" />
            <Model />
          </Suspense>
        </Canvas>
      ) : (
        <div>No GLB model found</div>
      )}
    </div>
  );
};

export default GLBViewer;