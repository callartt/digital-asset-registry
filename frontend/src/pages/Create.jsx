import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import { uploadToIPFS } from "../utils/ipfs";
import NFTModal from "../components/NFTModal";

export default function CreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [symbol, setSymbol] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mintedData, setMintedData] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  const nameError =
    name.length > 0 &&
    (name.length < 4 ||
      name.length > 50 ||
      /[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/.test(name));

  const nameHelperText =
    name.length < 4
      ? "Min 4 characters"
      : name.length > 50
      ? "Max 50 characters"
      : /[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/.test(name)
      ? "Use letters, numbers, spaces"
      : " ";

  const symbolError =
    symbol.length > 0 &&
    (symbol.length < 3 || symbol.length > 30 || /[^A-Z0-9 ]/.test(symbol));

  const symbolHelperText =
    symbol.length < 3
      ? "Min 3 characters"
      : symbol.length > 30
      ? "Max 30 characters"
      : /[^A-Z0-9 ]/.test(symbol)
      ? "Only A-Z, digits and spaces"
      : " ";

  const createdByError =
    createdBy.length > 0 &&
    (createdBy.length < 4 ||
      createdBy.length > 50 ||
      /[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/.test(createdBy));

  const createdByHelperText =
    createdBy.length < 4
      ? "Min 4 characters"
      : createdBy.length > 50
      ? "Max 50 characters"
      : /[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/.test(createdBy)
      ? "Use letters, numbers, spaces"
      : " ";

  const isReady =
    name.trim().length >= 4 &&
    name.trim().length <= 50 &&
    !/[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/.test(name) &&
    description.trim().length > 0 &&
    description.trim().length <= 200 &&
    symbol.trim().length >= 3 &&
    symbol.trim().length <= 30 &&
    !/[^A-Z0-9 ]/.test(symbol) &&
    (!createdBy ||
      (createdBy.length >= 4 &&
        createdBy.length <= 50 &&
        !/[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/.test(createdBy))) &&
    file;

  const handleMint = async () => {
    if (!isReady) {
      setStatus("Please fill all fields correctly and upload an image.");
      return;
    }
    try {
      setStatus("Uploading to IPFS...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddr = await signer.getAddress();
      setUserAddress(userAddr);
      const contract = await getContract(signer);

      const uri = await uploadToIPFS(
        name,
        description,
        file,
        createdBy || userAddr,
        symbol
      );

      setStatus("Waiting for blockchain transaction...");
      const tx = await contract.mintAsset(userAddr, uri);
      await tx.wait();

      const nextId = await contract.nextTokenId();
      const tokenId = Number(nextId) - 1;
      const owner = userAddr;
      const response = await fetch(uri.replace("ipfs://", "https://nftstorage.link/ipfs/"));
      const metadata = await response.json();

      setMintedData({
        id: tokenId,
        owner,
        ...metadata,
      });

      setOpenModal(true);
      setStatus("NFT successfully minted!");

      setName("");
      setDescription("");
      setCreatedBy("");
      setSymbol("");
      setFile(null);
      setPreview(null);
    } catch (err) {
      setStatus(
        err.code === 4001
          ? "Transaction was rejected by the user."
          : "Minting failed: " + (err.reason || err.message || "Unknown error")
      );
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3}>
        Create New NFT
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                error={nameError}
                helperText={nameHelperText}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                fullWidth
                error={symbolError}
                helperText={symbolHelperText}
              />
            </Grid>
          </Grid>
          <TextField
            label="Created By (optional)"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            error={createdByError}
            helperText={createdByHelperText}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleMint}
            disabled={!isReady}
            sx={{ mt: 2 }}
          >
            Mint NFT
          </Button>
          <Typography
            variant="body2"
            color={status.includes("failed") ? "error" : "primary"}
            mt={2}
          >
            {status}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
          <Paper
            sx={{
              width: 360,
              height: 360,
              position: "relative",
              cursor: "pointer",
              border: "2px dashed #999",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              boxShadow: "none",
              borderRadius: 2,
              p: 0,
            }}
            component="label"
          >
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
            )}
            {!preview && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  color: "#222",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  pointerEvents: "none",
                  textAlign: "center",
                  px: 2,
                }}
              >
                <Typography variant="h6">Upload your artwork</Typography>
                <Typography variant="body1">CHOOSE FILE</Typography>
                <Typography variant="caption">(Recommended: 400x400px)</Typography>
              </Box>
            )}
            <Box
              className="overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.3s",
                zIndex: 3,
                textAlign: "center",
                px: 2,
                cursor: "pointer",
                "&:hover": { opacity: 1 },
              }}
            >
              <Typography variant="h6">Upload your artwork</Typography>
              <Typography variant="body1">CHOOSE FILE</Typography>
              <Typography variant="caption">(Recommended: 400x400px)</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <NFTModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        nft={mintedData}
        userAddress={userAddress}
        action="view"
      />
    </Container>
  );
}
