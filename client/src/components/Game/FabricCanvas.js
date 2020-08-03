import React, { useContext, useEffect } from 'react';
import { FabricContext } from './FabricContextProvider';
import { fabric } from 'fabric';

const FabricCanvas = props => {
  const [canvas, initCanvas] = useContext(FabricContext);
  const CANVAS_X = 1000;
  const CANVAS_Y = 800;
  const MAX_SIZE = 300;
  const RIGHT_BOUND = CANVAS_X - (MAX_SIZE / 2);
  const MARGIN_SIZE = 50;
  const X_OFFSET = 75;
  const PLAYER_FONTSIZE = 20;
  const TITLE_FONTSIZE = 36;
  const IMG_TOP = MARGIN_SIZE + (TITLE_FONTSIZE * 2);

  useEffect(() => {
    const canvas = new fabric.Canvas('c');
    initCanvas(canvas);

    const title = new fabric.Textbox(props.title, {
      fontFamily: 'sans-serif',
      fontSize: TITLE_FONTSIZE,
      top: MARGIN_SIZE,
    });
    canvas.add(title);
    title.centerH();

    props.drawings.forEach((drawing, i) => {
      const label = `${i+1}-${props.players[i]}`;
      const player = new fabric.Textbox(label, {
        fontFamily: 'sans-serif',
        fontSize: PLAYER_FONTSIZE,
      });

      fetch('/api/signDownload', {
        method: 'POST',
        body: drawing
      }).then((response) => response.text())
      .then((url) => {
        fabric.Image.fromURL(url, function(img) {
          // Make sure images are a maximum of 400px per dimension
          const maxDim = Math.max(img.height, img.width);
          if (maxDim > MAX_SIZE) {
            const scale = MAX_SIZE / maxDim;
            img.scale(scale);
          }
          img.top = 2 * PLAYER_FONTSIZE;
          const group = new fabric.Group([ img, player ], {
            // Offset subsequent images a little bit, but not enough to
            // go off-canvas
            left: Math.min(MARGIN_SIZE + i*X_OFFSET, RIGHT_BOUND),
            top: IMG_TOP,
          });
          canvas.add(group);
        },{
          crossOrigin: 'anonymous'
        });
      });
    });

    // UseEffect's cleanup function
    return () => {
      canvas.dispose();
    };
  // eslint-disable-next-line
  }, []);

  return (
    <div className='FabricCanvas'>
      <canvas
        id='c'
        width={CANVAS_X}
        height={CANVAS_Y}
        style={{'boxShadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'}}
      />
    </div>
  );
}

export default FabricCanvas;
