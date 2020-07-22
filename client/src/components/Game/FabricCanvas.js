import React, { useContext, useEffect } from 'react';
import { FabricContext } from './FabricContextProvider';
import { fabric } from 'fabric';

const FabricCanvas = () => {
    const [canvas, initCanvas] = useContext(FabricContext);
    useEffect(() => {
        const localCanvas = new fabric.Canvas('c');
        initCanvas(localCanvas);
    }, []);

  return (
    <canvas
      id='c'
      width={500}
      height={500}
    />
  );
}

export default FabricCanvas;
