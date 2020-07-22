import React, { useContext, useEffect } from 'react';
import { FabricContext } from './FabricContextProvider';
import { fabric } from 'fabric';

const FabricCanvas = props => {
    const [canvas, initCanvas] = useContext(FabricContext);
    useEffect(() => {
        const canvas = new fabric.Canvas('c');
        initCanvas(canvas);
        props.drawings.forEach((drawing, i) => {
          fabric.Image.fromURL(drawing, function(img) {
            canvas.add(img);
          });
          const playerName = new fabric.Textbox(props.players[i], {
            fontSize: 20,
            left: 50,
            top: 100,
            width: 200
          });
          canvas.add(playerName);
        });

        // UseEffect's cleanup function
        return () => {
          canvas.dispose();
        };
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
