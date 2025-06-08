import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import NFTModal from "../components/NFTModal";
import { ipfsToHttp } from "../utils/ipfsUrl";

export default function Gallery({ userAddress }) {
  const [nfts, setNfts] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    let items = [];
    async function fetchNFTs() {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = await getContract(signer);

        let total = await contract.nextTokenId();

        for (let i = 0; i < total; i++) {
          try {
            let uri = await contract.tokenURI(i);
            if (!uri) continue;
            let gatewayUri = ipfsToHttp(uri);
            let response = await fetch(gatewayUri);
            if (!response.ok) continue;
            let metadata = await response.json();
            let owner = await contract.ownerOf(i);

            items.push({
              id: i,
              name: metadata.name || "",
              description: metadata.description || "",
              image: ipfsToHttp(metadata.image || ""),
              owner: owner.toString(),
              symbol: metadata.symbol || "",
              createdBy: metadata.createdBy || "",
            });
          } catch (err) {}
        }
        setNfts(items);
      } catch (err) {}
    }
    fetchNFTs();
  }, []);

  useEffect(() => {
    let result = nfts.slice();
    if (filter === "mine" && userAddress) {
      result = result.filter(
        (nft) =>
          nft.owner && nft.owner.toLowerCase() === userAddress.toLowerCase()
      );
    }
    if (searchId.trim() !== "") {
      let id = parseInt(searchId);
      if (!isNaN(id)) result = result.filter((nft) => nft.id === id);
    }
    setFilteredNFTs(result);
  }, [nfts, filter, searchId, userAddress]);

  function handleOpen(nft) {
    setSelectedNFT(nft);
  }

  function handleClose() {
    setSelectedNFT(null);
  }

  return (
    <Box p={2}>
      <Box
        sx={{
          py: { xs: 6, sm: 10 },
          px: 2,
          color: "#111",
          maxWidth: 1000,
          mx: "auto",
          textAlign: "left",
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Explore Digital Assets
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ fontSize: "1.1rem" }}
        >
          Browse NFTs created and owned on the blockchain.
        </Typography>
      </Box>

      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          mt: { xs: 4, sm: 6 },
          mb: { xs: 2, sm: 4 },
          borderBottom: "1px solid #ccc",
        }}
      />

      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          px: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="medium" gutterBottom>
          Gallery
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
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
            aria-label="filter"
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="mine" disabled={!userAddress}>
              My NFTs
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto", px: 2 }}>
        <Grid container spacing={3}>
          {filteredNFTs.map((nft) => (
            <Grid
              key={nft.id}
              sx={{
                flexBasis: { xs: "100%", sm: "50%", md: "23%" },
                maxWidth: { xs: "100%", sm: "50%", md: "23%" },
              }}
            >
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
                <Box
                  component="img"
                  src={nft.image}
                  alt={nft.name}
                  sx={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
                <CardContent
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {nft.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {nft.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    ID: {nft.id}
                  </Typography>
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
        />
      )}
    </Box>
  );
}
