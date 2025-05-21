import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import {
  WalletMinimal,
  Upload,
  GalleryHorizontal,
  Send,
  Search,
  Eye,
  EyeOff
} from "lucide-react";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = [
  "function mintAsset(address to, string memory tokenURI) external",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function nextTokenId() public view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");
  const [nftList, setNftList] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedTab, setSelectedTab] = useState("gallery");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFile, setNewFile] = useState(null);

  const [tokenId, setTokenId] = useState("");
  const [transferTo, setTransferTo] = useState("");

  const [checkId, setCheckId] = useState("");
  const [checkedNFT, setCheckedNFT] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return setStatus("Metamask not found");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setStatus("Wallet connected");
    } catch (err) {
      setStatus("Wallet connection error");
    }
  };

  const uploadToPinata = async (name, description, file) => {
    const formData = new FormData();
    formData.append("file", file);

    formData.append("pinataMetadata", JSON.stringify({ name }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const fileUpload = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    const imageCID = fileUpload.data.IpfsHash;

    const meta = {
      name,
      description,
      image: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
    };

    const jsonUpload = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", meta, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${jsonUpload.data.IpfsHash}`;
  };

  const handleMint = async () => {
    if (!walletAddress || !newName || !newDesc || !newFile) {
      return setStatus("Fill all fields");
    }

    try {
      setStatus("Uploading to IPFS...");
      const uri = await uploadToPinata(newName, newDesc, newFile);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.mintAsset(walletAddress, uri);
      await tx.wait();

      setStatus("NFT created");
      setNewName("");
      setNewDesc("");
      setNewFile(null);
    } catch (err) {
      console.log(err);
      setStatus("Minting failed");
    }
  };

  const fetchAllNFTs = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const count = await contract.nextTokenId();
      const arr = [];

      for (let i = 0; i < count; i++) {
        try {
          if (!showAll) {
            const owner = await contract.ownerOf(i);
            if (owner.toLowerCase() !== walletAddress.toLowerCase()) continue;
          }

          const uri = await contract.tokenURI(i);
          const url = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
          const res = await fetch(url);
          const meta = await res.json();

          arr.push({ id: i, ...meta });
        } catch {}
      }

      setNftList(arr);
    } catch (err) {
      console.log(err);
      setStatus("Error loading NFTs");
    }
  };

  const transferNFT = async () => {
    if (!walletAddress || !transferTo || tokenId === "") {
      return setStatus("Fill token ID and address");
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.transferFrom(walletAddress, transferTo, tokenId);
      await tx.wait();
      setStatus("NFT transferred");
    } catch (err) {
      console.log(err);
      setStatus("Transfer failed");
    }
  };

  const checkNFT = async () => {
    if (checkId === "") return setStatus("Enter ID");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const uri = await contract.tokenURI(checkId);
      const url = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
      const res = await fetch(url);
      const data = await res.json();
      setCheckedNFT(data);
      setStatus("NFT found");
    } catch {
      setCheckedNFT(null);
      setStatus("Not found");
    }
  };

  useEffect(() => {
    if (walletAddress) fetchAllNFTs();
  }, [walletAddress, showAll]);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", fontFamily: "Arial", padding: "20px" }}>
      <h1>Digital Asset Registry</h1>
      <p>Wallet: {walletAddress || "Not connected"}</p>
      <button onClick={connectWallet}>
        <WalletMinimal size={16} style={{ marginRight: "5px" }} />
        Connect Wallet
      </button>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setSelectedTab("gallery")}>
          <GalleryHorizontal size={16} style={{ marginRight: "5px" }} />
          Gallery
        </button>
        <button onClick={() => setSelectedTab("mint")}>
          <Upload size={16} style={{ marginRight: "5px" }} />
          Create NFT
        </button>
        <button onClick={() => setSelectedTab("transfer")}>
          <Send size={16} style={{ marginRight: "5px" }} />
          Transfer
        </button>
        <button onClick={() => setSelectedTab("check")}>
          <Search size={16} style={{ marginRight: "5px" }} />
          Check NFT
        </button>
        <button onClick={() => setShowAll(!showAll)}>
          {showAll ? (
            <>
              <EyeOff size={16} style={{ marginRight: "5px" }} />
              Only Mine
            </>
          ) : (
            <>
              <Eye size={16} style={{ marginRight: "5px" }} />
              Show All
            </>
          )}
        </button>
      </div>

      <p style={{ marginTop: "10px", color: status.includes("fail") ? "red" : "green" }}>{status}</p>

      {selectedTab === "gallery" && (
        <div style={{ marginTop: "20px" }}>
          {nftList.map((nft) => (
            <div key={nft.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
              <h3>ID #{nft.id}</h3>
              <img src={nft.image} alt={nft.name} width="300" />
              <p><strong>{nft.name}</strong></p>
              <p>{nft.description}</p>
            </div>
          ))}
        </div>
      )}

      {selectedTab === "mint" && (
        <div style={{ marginTop: "20px" }}>
          <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <br />
          <input type="text" placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <br />
          <input type="file" onChange={(e) => setNewFile(e.target.files[0])} />
          <br />
          <button onClick={handleMint}>Create</button>
        </div>
      )}

      {selectedTab === "transfer" && (
        <div style={{ marginTop: "20px" }}>
          <input type="number" placeholder="Token ID" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
          <br />
          <input type="text" placeholder="Recipient Address" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
          <br />
          <button onClick={transferNFT}>Send</button>
        </div>
      )}

      {selectedTab === "check" && (
        <div style={{ marginTop: "20px" }}>
          <input type="number" placeholder="Token ID" value={checkId} onChange={(e) => setCheckId(e.target.value)} />
          <br />
          <button onClick={checkNFT}>Check</button>

          {checkedNFT && (
            <div style={{ marginTop: "10px", border: "1px solid #ccc", padding: "10px" }}>
              <img src={checkedNFT.image} alt={checkedNFT.name} width="300" />
              <p><strong>{checkedNFT.name}</strong></p>
              <p>{checkedNFT.description}</p>
            </div>
          )}
        </div>
      )}

      <footer style={{ marginTop: "30px", textAlign: "center", color: "#777" }}>
        © 2025 Digital Asset Registry
      </footer>
    </div>
  );
}

export default App;
