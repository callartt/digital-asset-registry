import { Box } from "@mui/material";

export default function NFTPreview({ src }) {
  return (
    <Box
      component="img"
      src={src}
      alt="NFT"
      sx={{
        width: "100%",
        height: 260,
        objectFit: "cover",
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        display: "block",
      }}
    />
  );
}
