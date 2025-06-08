import { useState } from "react";
import { Modal, Box, Fade, Backdrop, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import NFTInfoBlock from "./NFTInfoBlock";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import { ipfsToHttp } from "../utils/ipfsUrl";

export default function NFTModal({
  open,
  handleClose,
  nft,
  userAddress,
  onActionComplete,
  action = "market",
  recipient,
  onSend,
  loading,
}) {
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [price, setPrice] = useState("");

  if (!nft) return null;

  const isOwner = userAddress && nft.owner?.toLowerCase() === userAddress.toLowerCase();
  const isListed = nft.price > 0;

  const handleListForSale = async () => {
    if (!price || Number(price) <= 0) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const priceWei = ethers.parseEther(price);
      const tx = await contract.listTokenForSale(nft.id, priceWei);
      await tx.wait();
      setSellDialogOpen(false);
      setPrice("");
      handleClose();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setSellDialogOpen(false);
      setPrice("");
    }
  };

  const handleUnlist = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.unlistToken(nft.id);
      await tx.wait();
      handleClose();
      if (onActionComplete) onActionComplete();
    } catch {}
  };

  const handleBuy = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.buyToken(nft.id, {
        value: ethers.parseEther(nft.price.toString()),
      });
      await tx.wait();
      handleClose();
      if (onActionComplete) onActionComplete();
    } catch {}
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300 }}
      >
        <Fade in={open} timeout={300}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 700,
              maxWidth: "95vw",
              bgcolor: "background.paper",
              boxShadow: 6,
              borderRadius: 3,
              p: 3,
              outline: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              fontWeight="bold"
              sx={{ userSelect: "none", mb: 4 }}
            >
              {action === "transfer"
                ? "Confirm NFT Transfer"
                : action === "view"
                ? "NFT Created Successfully"
                : "NFT Details"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
                mb: 3,
                flexGrow: 1,
              }}
            >
              <Box
                component="img"
                src={ipfsToHttp(nft.image)}
                alt={nft.name}
                sx={{
                  width: 260,
                  height: 260,
                  objectFit: "cover",
                  borderRadius: 2,
                  backgroundColor: "#f0f0f0",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <NFTInfoBlock
                  name={nft.name}
                  symbol={nft.symbol}
                  tokenId={nft.id || nft.tokenId}
                  description={nft.description}
                  owner={nft.owner}
                  createdBy={nft.createdBy}
                />


                {action === "market" && isListed && (
                  <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                    Price: {nft.price} ETH
                  </Typography>
                )}

                {userAddress && (
                  <Box sx={{ mt: 2 }}>
                    {action === "market" &&
                      (isOwner ? (
                        isListed ? (
                          <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={handleUnlist}
                          >
                            Unlist
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="warning"
                            fullWidth
                            onClick={() => setSellDialogOpen(true)}
                          >
                            List for Sale
                          </Button>
                        )
                      ) : (
                        isListed && (
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleBuy}
                          >
                            Buy now
                          </Button>
                        )
                      ))}
                    {action === "transfer" && (
                      <>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          <strong>Recipient:</strong> {recipient}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={onSend}
                          disabled={loading}
                          sx={{ mt: 2, minWidth: 120 }}
                        >
                          {loading ? "Sending..." : "Send"}
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ alignSelf: "center", minWidth: 100, mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>

      <Dialog open={sellDialogOpen} onClose={() => { setSellDialogOpen(false); setPrice(""); }}>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>Set Price</DialogTitle>
        <DialogContent>
          <input
            type="number"
            min="0"
            step="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price in ETH"
            style={{
              width: "100%",
              fontSize: 18,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              outline: "none",
              marginTop: 8,
              background: "#f6f6f6",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSellDialogOpen(false); setPrice(""); }}>Cancel</Button>
          <Button onClick={handleListForSale} disabled={!price || Number(price) <= 0} variant="contained">
            List
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
