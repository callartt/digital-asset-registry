import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 6,
        py: 3,
        bgcolor: "#f6f6f6",
        borderTop: "1px solid #e0e0e0",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Digital Asset Registry |{" "}
        <Link
          href="https://github.com/callartt/digital-asset-registry"
          target="_blank"
          underline="hover"
          color="inherit"
        >
          GitHub
        </Link>
      </Typography>
    </Box>
  );
}
