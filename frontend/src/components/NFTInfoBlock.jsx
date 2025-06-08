import { Typography, Box } from "@mui/material";

export default function NFTInfoBlock({ name, symbol, tokenId, description, owner, createdBy }) {
  const formatAddress = (addr) =>
    typeof addr === "string" && addr.startsWith("0x")
      ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
      : addr;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <Box>
        {name && (
          <Typography variant="h4" fontWeight="bold" align="left" gutterBottom>
            {name}
          </Typography>
        )}
        {symbol && (
          <Typography variant="body1">
            <b>Symbol:</b> {symbol}
          </Typography>
        )}
        {description && (
          <>
            <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
              Description:
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {description}
            </Typography>
          </>
        )}
      </Box>
      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
        {tokenId && (
          <Typography variant="body2">
            <b>Token ID:</b> {tokenId}
          </Typography>
        )}
        {owner && (
          <Typography variant="body2">
            <b>Owner:</b> {formatAddress(owner)}
          </Typography>
        )}
        {createdBy && (
          <Typography variant="body2">
            <b>Created by:</b> {formatAddress(createdBy)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
