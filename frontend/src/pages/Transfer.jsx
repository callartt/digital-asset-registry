import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import NFTModal from "../components/NFTModal";

export default function Transfer({ userAddress }) {
  const [tokenId, setTokenId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [nftData, setNftData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [senderAddress, setSenderAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!tokenId) {
      setStatus("Enter token ID");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getContract(provider);
      const uri = await contract.tokenURI(tokenId);
      const gatewayUri = uri.replace("ipfs://", "https://nftstorage.link/ipfs/");
      const response = await fetch(gatewayUri);
      if (!response.ok) throw new Error("NFT metadata not found");
      const metadata = await response.json();
      const owner = await contract.ownerOf(tokenId);
      const symbol = await contract.symbol();
      const createdBy = metadata.createdBy || null;
      if (userAddress?.toLowerCase() !== owner.toLowerCase()) {
        setStatus("You are not the owner of this token");
        return;
      }
      setNftData({
        ...metadata,
        tokenId,
        symbol,
        createdBy,
        owner,
      });
      setModalOpen(true);
      setStatus("");
    } catch (err) {
      setStatus("NFT not found or you are not the owner");
      console.error("Preview failed:", err);
    }
  };

  const handleTransfer = async () => {
    if (!ethers.isAddress(recipient)) {
      setStatus("Invalid recipient address");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = await getContract(signer);
      const sender = await signer.getAddress();
      const tx = await contract.transferFrom(sender, recipient, tokenId);
      await tx.wait();
      const newOwner = await contract.ownerOf(tokenId);
      if (newOwner.toLowerCase() !== recipient.toLowerCase()) {
        throw new Error("Owner did not change");
      }
      setSenderAddress(sender);
      setModalOpen(false);
      setOpenDialog(true);
      setNftData(null);
      setStatus("Transfer successful");
    } catch (err) {
      setStatus("Transfer failed");
      console.error("Transfer failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>Transfer NFT</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Token ID"
          value={tokenId}
          onChange={e => setTokenId(e.target.value.replace(/\D/g, ""))}
          type="number"
          fullWidth
        />
        <TextField
          label="Recipient Address"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handlePreview}
          disabled={!tokenId}
        >
          Preview & Send
        </Button>
        <Typography
          variant="body2"
          color={status.includes("fail") || status.includes("not") ? "error" : "primary"}
        >
          {status}
        </Typography>
      </Box>

      <NFTModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        nft={nftData}
        userAddress={userAddress}
        action="transfer"
        recipient={recipient}
        onSend={handleTransfer}
        loading={loading}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Transfer Successful</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography><strong>Token ID:</strong> {tokenId}</Typography>
          <Typography sx={{ mt: 1 }}><strong>From:</strong> {senderAddress}</Typography>
          <Typography><strong>To:</strong> {recipient}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setOpenDialog(false)} variant="contained">Done</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
