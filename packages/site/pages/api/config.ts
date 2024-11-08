import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId } = req.query;

  console.log('API handler: Received chainId:', chainId);

  // If `chainId` is provided, retrieve the specific Biconomy API key for that chain
  if (chainId) {
    const apiKey = process.env[`BICONOMY_PAYMASTER_API_KEY_${chainId}`];

    console.log(
      `API handler: Retrieved API key for chainId ${chainId}:`,
      apiKey,
    );

    if (!apiKey) {
      return res
        .status(403)
        .json({ error: 'API key not found for this chain ID' });
    }

    return res.status(200).json({ apiKey });
  }

  // Otherwise, return the general Particle and Pinata configurations
  res.status(200).json({
    projectId: process.env.PARTICLE_PROJECT_ID,
    clientKey: process.env.PARTICLE_CLIENT_KEY,
    appId: process.env.PARTICLE_APP_ID,
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataApiSecret: process.env.PINATA_API_SECRET,
    pinataJwt: process.env.PINATA_JWT,
    ipfsGateway: process.env.IPFS_GATEWAY,
    pinataBaseUrl: process.env.PINATA_BASE_URL,
    portalAuthToken: process.env.PORTAL_AUTH_TOKEN,
    fabstirDbBackendUrl: process.env.FABSTIRDB_BACKEND_URL,
    fabstirMediaPlayerInstance: process.env.FABSTIR_MEDIA_PLAYER_INSTANCE,
    fabstirSaltKey: process.env.FABSTIR_SALT_KEY,
    fabstirSaltPair: process.env.FABSTIR_SALT_PAIR,
    fabstirControllerUrl: process.env.FABSTIR_CONTROLLER_URL,
    subscriptionControllerPub: process.env.SUBSCRIPTION_CONTROLLER_PUB,
    subscriptionControllerEPub: process.env.SUBSCRIPTION_CONTROLLER_EPUB,
    s5PortalUrl: process.env.PORTAL_URL,
    s5PortalUrl3d: process.env.PORTAL_URL_3D,
    portalType: process.env.PORTAL_TYPE,
    fabstirTranscoderUrl: process.env.FABSTIR_TRANSCODER_URL,
    s5PortalStreamingUrlL: process.env.S5_PORTAL_STREAMING_URL,
    sponsoredAccountPrivateKey: process.env.SPONSORED_ACCOUNT_PRIVATE_KEY,
  });
}
