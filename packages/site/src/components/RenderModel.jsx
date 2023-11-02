import React, { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftMetaDataAtom';

import init, {
  render_model,
  stop_rendering,
} from '../../public/wgpu_fabstir_renderer.js';

/**
 * RenderModel is a React component that is responsible for rendering a 3D model.
 * It takes a props object as a parameter, which includes all the properties passed to the component.
 */
export default function RenderModel({
  nft,
  is3dModel,
  setIs3dModel,
  isWasmReady,
  setIsWasmReady,
  nftInformationDecorator,
}) {
  /**
   * State to hold the current NFT metadata.
   * @type {[Object, Function]}
   */
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  const canvasRef = useRef(null);
  const nftInfoDecorated = nftInformationDecorator(nft ? nft : null);

  useEffect(() => {
    init()
      .then(() => {
        console.log('DetailsSidebar1: WebAssembly module initialized');
        setIsWasmReady(true);
      })
      .catch((e) => {
        console.error(
          'DetailsSidebar1: Failed to initialize WebAssembly module:',
          e,
        );
      });
  }, []);

  useEffect(() => {
    // Define get_canvas_size in the global scope
    window.get_canvas_size = function () {
      const canvas = document.getElementById('nftFrame');
      console.log(
        'DetailsSidebar: get_canvas_size: ',
        canvas.clientWidth,
        canvas.clientHeight,
      );
      return { width: canvas.clientWidth, height: canvas.clientHeight };
    };
  }, []);

  async function handleRenderModel(uri, extension) {
    try {
      console.log('DetailsSidebar: handleRenderModel: uri = ', uri);
      console.log('DetailsSidebar: handleRenderModel: extension = ', extension);

      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      if (isWasmReady) {
        try {
          console.log(
            `DetailsSidebar: await render_model(canvas, model_url, extension);`,
          );
          const model_url = `${process.env.NEXT_PUBLIC_PORTAL_URL_3D}/${uri}`;
          await render_model(canvas, model_url, extension);
        } catch (err) {
          // ignore expected exception
        }
      }
    } catch (e) {
      console.error('DetailsSidebar: Failed to render model:', e);
    }
  }

  useEffect(() => {
    if (
      nftInfoDecorated &&
      'fileUrls' in nftInfoDecorated &&
      nftInfoDecorated.fileUrls
    ) {
      //      setFileUrls(nftInfoDecorated.fileUrls);

      const renderModels = async () => {
        setIs3dModel(false);

        for (const [key, value] of Object.entries(nftInfoDecorated.fileUrls)) {
          let [uri, extension] = value.split('.');
          console.log('DetailsSidebar: uri = ', uri);

          extension = extension.split('<')[0];
          console.log('DetailsSidebar: extension = ', extension);

          if (
            extension.toLowerCase() === 'obj' ||
            extension.toLowerCase() === 'gltf'
          ) {
            console.log('DetailsSidebar: value = ', value);
            setIs3dModel(true);

            await handleRenderModel(uri, extension);
          }
        }
      };
      renderModels();
    }
    console.log('DetailsSidebar: nftInfoDecorated = ', nftInfoDecorated);
  }, [nft]);

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      className={`absolute z-0 w-full h-full ${
        is3dModel ? 'opacity-100' : 'opacity-0'
      }`}
    ></canvas>
  );
}
