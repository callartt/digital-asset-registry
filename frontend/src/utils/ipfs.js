import axios from "axios";

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

export const uploadToIPFS = async (name, description, file, createdBy, symbol) => {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.error("Pinata API keys are missing");
    throw new Error("Pinata API keys are not set in env");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pinataMetadata", JSON.stringify({ name }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const fileRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );
    const imageCID = fileRes.data.IpfsHash;

    const metadata = {
      name,
      description,
      image: `ipfs://${imageCID}`,
      createdBy,
      symbol,
    };

    const jsonRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );
    const metadataCID = jsonRes.data.IpfsHash;

    return `ipfs://${metadataCID}`; 
  } catch (err) {
    console.error("IPFS upload error:", err.response?.data || err.message || err);
    throw err;
  }
};
