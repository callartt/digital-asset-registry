export function ipfsToHttp(url) {
    if (!url) return "";
    return url.startsWith("ipfs://")
      ? url.replace("ipfs://", "https://nftstorage.link/ipfs/")
      : url;
  }
  