import { useState, useEffect, useCallback } from "react";
import { Button, Typography } from "@mui/material";

export default function WalletConnector({ onConnected }) {
  const [wallet, setWallet] = useState(null);

  const connect = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      setWallet(account);
      onConnected(account);
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const disconnect = useCallback(() => {
    setWallet(null);
    onConnected(null);

    if (window.ethereum && window.ethereum._state) {
      window.ethereum._state.accounts = [];
    }
  }, [onConnected]);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet(accounts[0]);
        onConnected(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [disconnect, onConnected]);

  return wallet ? (
    <>
      <Typography variant="body2" sx={{ mr: 2 }}>
        {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </Typography>
      <Button variant="outlined" onClick={disconnect}>
       Switch Address
      </Button>
    </>
  ) : (
    <Button variant="contained" onClick={connect}>
      Connect Wallet
    </Button>
  );
}
