"use client";

import { api } from "@/lib/api/baseJsonApi";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Chip,
  Paper,
  Button
} from "@mui/material";

export default function GameSearch({ onGuess, disabled }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);

  // 1. Xử lý click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Logic Fetch API
  useEffect(() => {
    if (query.length < 2 || disabled) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.get(
          `/api/data/search?q=${encodeURIComponent(query)}&limit=5`
        );

        if (result.success) {
          setSuggestions(result.data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, disabled]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) setShowDropdown(false);
  };

  const handleSelect = (anime) => {
    onGuess(anime);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <Box position="relative" width="100%" maxWidth={600} ref={wrapperRef}>
      <Box display="flex" component="form" onSubmit={handleSubmit} sx={{ boxShadow: 1, borderRadius: 1, bgcolor: "background.paper" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nhập tên để tìm kiếm..."
          value={query}
          onChange={handleInputChange}
          disabled={disabled}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          InputProps={{
            sx: { borderTopRightRadius: 0, borderBottomRightRadius: 0, bgcolor: "white" },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={disabled || loading}
          sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, minWidth: 100, fontWeight: "bold" }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Đoán"}
        </Button>
      </Box>

      {/* Dropdown Gợi ý */}
      {showDropdown && suggestions.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            width: "100%",
            mt: 1,
            zIndex: 1000,
            maxHeight: 300,
            overflowY: "auto",
            borderRadius: 2,
            animation: "fade-in 0.2s ease"
          }}
        >
          <List disablePadding>
            {suggestions.map((item, index) => (
              <ListItem key={item.id} disablePadding divider={index < suggestions.length - 1}>
                <ListItemButton onClick={() => handleSelect(item)} sx={{ p: 1.5, gap: 2 }}>
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={item.thumbnail}
                      sx={{ width: 40, height: 55 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold" noWrap>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        {item.release_year && (
                          <Chip label={item.release_year} size="small" variant="outlined" />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          • {new Intl.NumberFormat().format(item.views || 0)} views
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Thông báo không tìm thấy */}
      {showDropdown && !loading && query.length >= 2 && suggestions.length === 0 && (
        <Paper elevation={2} sx={{ position: "absolute", width: "100%", mt: 1, zIndex: 1000, p: 2 }}>
          <Typography color="text.secondary" align="center">
            Không tìm thấy kết quả phù hợp
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
