import React, { createContext, useState } from 'react';
import Endgame from './Endgame';

// This is the context that components in need of canvas-access will use:
export const FabricContext = createContext([null, () => {}]);

/**
 * This context provider will be rendered as a wrapper component and will give the
 * canvas context to all of its children.
 */
export const FabricContextProvider = props => {
  const [canvas, setCanvas] = useState(null);

  const initCanvas = c => setCanvas(c);

  return (
    <FabricContext.Provider value={[canvas, initCanvas]}>
      <Endgame />
    </FabricContext.Provider>
  );
};
