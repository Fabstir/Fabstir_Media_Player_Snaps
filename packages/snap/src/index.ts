import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { defaultSnapOrigin } from '../config';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */

/**
 *
 * @param newState
 */
async function saveState(state: string[]) {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: state },
  });
}

async function loadState(): Promise<string[]> {
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });

  console.log('loadState:= ', state);

  if (state) return state;
  else return [];
}

export const onRpcRequest: OnRpcRequestHandler = async ({
  //  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });

    case 'save_state': {
      console.log('save_state');
      const addresses = request.params as string[];
      await saveState(addresses);
      break;
    }
    case 'load_state': {
      console.log('load_state');
      const addresses = await loadState();
      return {
        addresses,
      };
    }

    default:
      throw new Error('Method not found.');
  }
};
