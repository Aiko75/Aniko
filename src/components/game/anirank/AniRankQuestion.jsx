"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/baseJsonApi";
import {
  Box,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Typography,
  IconButton,
  ListItemButton,
} from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";

export default function AniRankQuestion({
  question,
  requirement,
  type,
  hintUsed,
  targetCount,
  hint,
  onSubmitAnswer,
  onHintUsed,
}) {
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [input, suggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const result = await api.get(
          `/api/data/search?q=${encodeURIComponent(input.trim())}&limit=6`,
        );
        if (result.success) {
          setSuggestions(result.data || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Không thể tải gợi ý anime:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedIndex]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (showDropdown && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSuggestionSelect(suggestions[selectedIndex]);
      return;
    }
    onSubmitAnswer(input.trim());
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleSuggestionSelect = (anime) => {
    const title = anime?.title?.trim();
    if (!title) return;
    setInput(title);
    onSubmitAnswer(title);
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleHint = () => {
    setShowHint(true);
    onHintUsed?.();
  };

  return (
    <Box>
      <Box position="relative" ref={wrapperRef} mb={2}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Nhập tên anime..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              autoFocus
              InputProps={{
                sx: { borderRadius: "16px", bgcolor: "white" },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!input.trim()}
              sx={{
                px: 3,
                fontWeight: 700,
                borderRadius: "16px",
                background: input.trim()
                  ? "linear-gradient(to bottom right, #0ea5e9, #0284c7)"
                  : "grey.500",
              }}
            >
              Gửi
            </Button>
            {!hintUsed && (
              <IconButton
                onClick={handleHint}
                sx={{
                  border: "1px solid",
                  borderColor: "warning.main",
                  color: "warning.main",
                  borderRadius: "12px",
                  bgcolor: "white",
                  "&:hover": {
                    bgcolor: "warning.light",
                    color: "white",
                  },
                }}
              >
                <EmojiObjectsIcon />
              </IconButton>
            )}
          </Box>
        </form>

        {showDropdown && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              zIndex: 20,
              mt: 1,
              maxHeight: 340,
              width: "100%",
              overflow: "auto",
              borderRadius: "12px",
            }}
          >
            {loadingSuggestions ? (
              <Box py={2} textAlign="center" color="text.secondary">
                <CircularProgress size={20} sx={{ mr: 1, verticalAlign: "middle" }} />
                Đang tải gợi ý...
              </Box>
            ) : suggestions.length === 0 ? (
              <Box py={2} textAlign="center" color="text.secondary">
                Không có kết quả phù hợp
              </Box>
            ) : (
              <List disablePadding>
                {suggestions.map((anime, index) => (
                  <ListItem disablePadding key={anime.id} divider>
                    <ListItemButton
                      selected={index === selectedIndex}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => handleSuggestionSelect(anime)}
                      sx={{
                        "&.Mui-selected": {
                          bgcolor: "info.light",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={anime.thumbnail || ""}
                          alt={anime.title}
                          sx={{ width: 38, height: 52 }}
                        >
                          {!anime.thumbnail && "N/A"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {anime.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {anime.release_year || "?"} ·{" "}
                            {new Intl.NumberFormat().format(anime.views || 0)} views
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>

      {showHint && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "warning.main",
            bgcolor: "warning.50",
            borderRadius: "12px",
          }}
        >
          <Typography variant="body2" color="text.primary">
            <span style={{ marginRight: 8 }}>💡</span>
            <strong>Gợi ý:</strong> {hint || "Thử nhớ đến các anime phổ biến trong đúng bộ lọc của câu hỏi."}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
