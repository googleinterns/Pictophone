import React, { useContext, useEffect } from 'react';
import { FabricContext } from './FabricContextProvider';
import { fabric } from 'fabric';

const FabricCanvas = props => {
    const [canvas, initCanvas] = useContext(FabricContext);
    const canvasX = 1000;
    const canvasY = 800;
    useEffect(() => {
        const canvas = new fabric.Canvas('c');
        initCanvas(canvas);

        const title = new fabric.Textbox(props.title, {
          fontFamily: 'sans-serif',
          fontSize: 36,
          top: 50,
        });
        canvas.add(title);
        title.centerH();

        props.drawings.forEach((drawing, i) => {

          const label = i+1 + '-' + props.players[i];
          const player = new fabric.Textbox(label, {
            fontFamily: 'sans-serif',
            fontSize: 20,
          });

          fabric.Image.fromURL(drawing, function(img) {
            // Make sure images are a maximum of 400px per dimension
            const maxDim = Math.max(img.height, img.width);
            if (maxDim > 400) {
              const scale = 400 / maxDim;
              img.scale(scale);
            }
            img.top = 40;
            const group = new fabric.Group([ img, player ], {
              // Offset subsequent images a little bit, but not enough to
              // go off-canvas
              left: Math.min(50 + i*75, 800),
              top: 100,
            });
            canvas.add(group);
          });
        });

        // UseEffect's cleanup function
        return () => {
          canvas.dispose();
        };
    }, []);

  return (
    <canvas
      id='c'
      width={canvasX}
      height={canvasY}
      style={{'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'}}
    />
  );
}

export default FabricCanvas;
