import React, { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftMetaDataAtom';

import init, {
  load_model,
  render_model,
  stop_render,
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
  modelUris,
}) {
  /**
   * State to hold the current NFT metadata.
   * @type {[Object, Function]}
   */
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);
  const isFirstRender = useRef(true);

  const canvasRef = useRef(null);

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
      if (!canvas) return;

      console.log(
        'DetailsSidebar: get_canvas_size: ',
        canvas.clientWidth,
        canvas.clientHeight,
      );
      return { width: canvas.clientWidth, height: canvas.clientHeight };
    };
  }, []);

<<<<<<< HEAD
=======
  useEffect(() => {
    const stopRendering = async () => {
      if (!isWasmReady) return;

      const canvas = canvasRef.current;
      if (!is3dModel && canvas) {
        await stop_rendering(canvas);
      }
    };

    stopRendering();
  }, [is3dModel]);

>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
  async function handleRenderModel(uris) {
    try {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      if (isWasmReady) {
        try {
          console.log('DetailsSidebar: callback: setIs3dModel(true)');
          console.log(
            `DetailsSidebar: await render_model(canvas, model_urls, extensions);`,
          );

          const model_urls = [];
          const extensions = [];

          for (const uri of uris) {
            let [cid, extension] = uri.split('.');

            const model_url = `${process.env.NEXT_PUBLIC_PORTAL_URL_3D}/${cid}`;
            console.log(
              `DetailsSidebar: (model_url, extension) = (${model_url}, ${extension})`,
            );
            model_urls.push(model_url);
            extensions.push(extension);
          }

          if (model_urls.length === 0) return;

          const callback = () => {
<<<<<<< HEAD
            if (!is3dModel) setIs3dModel(true);
            //            setModelRendered(true);
            //console.log('wgpu_renderer: hello');
          };

          console.log('DetailsSidebar: callback: setIs3dModel(true)2');

          if (isFirstRender.current) {
            try {
              await render_model(canvas, model_urls, extensions, callback);
            } catch (err) {
              console.error('Error calling render_model:', err);
            }
            isFirstRender.current = false;
          } else load_model(model_urls, extensions);

=======
            //            setIs3dModel(true);
            //            setModelRendered(true);
          };

          console.log('DetailsSidebar: callback: setIs3dModel(true)2');
          await render_model(canvas, model_urls, extensions, callback);
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
          setIs3dModel(true);
        } catch (err) {
          // ignore expected exception
        }
      }
    } catch (e) {
      console.error('DetailsSidebar: Failed to render model:', e);
    }
  }

  useEffect(() => {
    if (!isWasmReady) return;

<<<<<<< HEAD
    if (modelUris?.length > 0) {
=======
    if (
      nftInfoDecorated &&
      'fileUrls' in nftInfoDecorated &&
      nftInfoDecorated.fileUrls
    ) {
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
      //      setFileUrls(nftInfoDecorated.fileUrls);

      const renderModels = async () => {
        //        setIs3dModel(false);

<<<<<<< HEAD
        //        await new Promise((resolve) => setTimeout(resolve, 2000));
        await handleRenderModel(modelUris);
      };
      renderModels();
    }
=======
        const uris = [];
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
            uris.push(`${uri}.${extension.toLowerCase()}`);
          }
        }

        if (uris.length === 0) return;
        await handleRenderModel(uris);
      };
      renderModels();
    }
    console.log('DetailsSidebar: nftInfoDecorated = ', nftInfoDecorated);
>>>>>>> 64f928fb34bc64b97320b733ac8eb849de607082
  }, [nft, isWasmReady]);

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      className={`absolute z-10 w-full h-full ${
        is3dModel ? 'opacity-100' : 'opacity-0'
      }`}
    ></canvas>
  );
}
