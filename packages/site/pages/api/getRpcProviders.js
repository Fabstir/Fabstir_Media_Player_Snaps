export default function handler(req, res) {
  const { chainId } = req.query;

  console.log('API handler: Received chainId:', chainId);

  function getRpcProviders() {
    const rpcProviders = [];

    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('RPC_PROVIDER_')) {
        const chainId = Number(key.split('_').pop());
        rpcProviders.push({ chainId, rpcProviderUrl: value });
      }
    }

    return rpcProviders;
  }

  // Otherwise, return the general Particle and Pinata configurations
  res.status(200).json({
    rpcProviders: getRpcProviders(),
  });
}
