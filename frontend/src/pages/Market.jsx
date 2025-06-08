import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import NFTModal from "../components/NFTModal";
import { ipfsToHttp } from "../utils/ipfsUrl";

export default function Market({ userAddress }) {
  const [nfts, setNfts] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filter, setFilter] = useState("market");
  const [selectedNFT, setSelectedNFT] = useState(null);

  const fetchNFTs = useCallback(async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = await getContract(signer);

      let items = [];
      const total = await contract.nextTokenId();

      for (let i = 0; i < total; i++) {
        try {
          let uri = await contract.tokenURI(i);
          if (!uri) continue;
          let gatewayUri = ipfsToHttp(uri);
          let response = await fetch(gatewayUri);
          if (!response.ok) continue;

          let metadata = await response.json();
          let image = ipfsToHttp(metadata.image);

          const owner = await contract.ownerOf(i);
          const priceWei = await contract.getPrice(i);
          const priceEth = Number(ethers.formatEther(priceWei));

          items.push({
            id: i,
            name: metadata.name || "",
            description: metadata.description || "",
            image: image || "",
            symbol: metadata.symbol || "",
            createdBy: metadata.createdBy || "",
            price: priceEth,
            owner: owner.toString(),
          });
        } catch (err) {
          console.warn(`Skipping token ${i}:`, err.message || err);
        }
      }

      setNfts(items);
    } catch (error) {
      console.error("Error loading NFTs:", error.message || error);
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  useEffect(() => {
    let result = [...nfts];
    if (filter === "mine" && userAddress) {
      result = result.filter(
        (nft) => nft.owner?.toLowerCase() === userAddress.toLowerCase()
      );
    } else if (filter === "market") {
      result = result.filter((nft) => nft.price > 0);
    }

    if (searchId.trim() !== "") {
      const id = parseInt(searchId);
      if (!isNaN(id)) {
        result = result.filter((nft) => nft.id === id);
      }
    }
    setFilteredNFTs(result);
  }, [nfts, filter, searchId, userAddress]);

  const handleOpen = (nft) => setSelectedNFT(nft);
  const handleClose = () => setSelectedNFT(null);

  return (
    <Box p={2}>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: 2, mb: 4 }}>
        <Typography variant="h4" fontWeight="medium" gutterBottom>
          Market
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Search by Token ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            type="number"
            size="small"
          />
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, value) => value && setFilter(value)}
            size="small"
          >
            <ToggleButton value="market">Listed</ToggleButton>
            <ToggleButton value="mine" disabled={!userAddress}>
              My NFTs
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: 2 }}>
        <Grid container spacing={3}>
          {filteredNFTs.map((nft) => (
            <Grid key={nft.id} sx={{ flexBasis: { xs: "100%", sm: "50%", md: "23%" } }}>
              <Card
                sx={{
                  bgcolor: "#f9f9f9",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 2,
                  cursor: "pointer",
                  transition: "0.3s",
                  backdropFilter: "blur(2px)",
                  "&:hover": {
                    boxShadow: 5,
                    transform: "translateY(-3px)",
                  },
                }}
                onClick={() => handleOpen(nft)}
              >
                <Box component="img" src={nft.image} sx={{ width: "100%", height: 220 }} />
                <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {nft.price > 0 ? (
                    <Chip
                      label={
                        nft.owner?.toLowerCase() === userAddress?.toLowerCase()
                          ? "Your listing"
                          : "Listed"
                      }
                      size="small"
                      color={
                        nft.owner?.toLowerCase() === userAddress?.toLowerCase()
                          ? "primary"
                          : "success"
                      }
                      sx={{ alignSelf: "flex-start", mb: 0.5 }}
                    />
                  ) : (
                    <Chip
                      label="Not listed"
                      size="small"
                      color="default"
                      sx={{
                        bgcolor: "#e0e0e0",
                        color: "#888",
                        alignSelf: "flex-start",
                        mb: 0.5,
                        fontWeight: 400,
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {nft.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {nft.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    ID: {nft.id}
                  </Typography>
                  {nft.price > 0 && (
                    <Typography variant="body2" color="primary" fontWeight="medium">
                      {nft.price} ETH
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {selectedNFT && (
        <NFTModal
          open={Boolean(selectedNFT)}
          handleClose={handleClose}
          nft={selectedNFT}
          userAddress={userAddress}
          onActionComplete={() => {
            fetchNFTs();
            handleClose();
          }}
        />
      )}
    </Box>
  );
}
