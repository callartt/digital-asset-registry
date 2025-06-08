import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import Gallery from "./pages/Gallery";
import Transfer from "./pages/Transfer";
import Create from "./pages/Create";
import WalletConnector from "./components/WalletConnector";
import "./App.css";
import Market from "./pages/Market";
import Footer from "./components/Footer";

function App() {
  const [userAddress, setUserAddress] = useState(null);

  const handleConnected = useCallback((address) => {
    setUserAddress(address);
  }, []);

  return (
    <Router>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ mr: 4 }}>
              Digital Asset Registry
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Button component={Link} to="/" color="inherit">
                Gallery
              </Button>
              <Button component={Link} to="/market" color="inherit">
                Market
              </Button>
              <Button component={Link} to="/transfer" color="inherit">
                Transfer
              </Button>
              <Button component={Link} to="/create" color="inherit">
                Create NFT
              </Button>
            </Box>
            <WalletConnector onConnected={handleConnected} />
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            mt: 4,
            mb: 4,
          }}
        >
          <Routes>
            <Route path="/market" element={<Market userAddress={userAddress} />} />
            <Route path="/" element={<Gallery userAddress={userAddress} />} />
            <Route path="/create" element={<Create userAddress={userAddress} />} />
            <Route path="/transfer" element={<Transfer userAddress={userAddress} />} />
          </Routes>
        </Container>

        <Footer />
      </Box>
    </Router>
  );
}

export default App;
