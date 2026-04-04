"use client";

import {
  Box,
  Paper,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function FilterBar({
  filters,
  options,
  loading,
  onUpdate,
  onReset,
}) {
  const getOptionsWithAll = (list) => {
    if (!list) return ["All"];
    return ["All", ...list];
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      {/* Hàng 1: Dropdown cơ bản */}
      <Grid container spacing={3}>
        {/* Genre Select */}
        <Grid item xs={12} md={4}>
          <FilterSelect
            label="Thể loại"
            value={filters.genre}
            onChange={(val) => onUpdate("genre", val)}
            options={getOptionsWithAll(options?.genres)}
            disabled={loading}
          />
        </Grid>

        {/* Studio Select */}
        <Grid item xs={12} md={4}>
          <FilterSelect
            label="Studio"
            value={filters.studio}
            onChange={(val) => onUpdate("studio", val)}
            options={getOptionsWithAll(options?.studios)}
            disabled={loading}
          />
        </Grid>

        {/* Sort Select */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <Typography variant="overline" color="text.secondary" fontWeight="bold">
              Sắp xếp
            </Typography>
            <Select
              value={filters.sortBy}
              onChange={(e) => onUpdate("sortBy", e.target.value)}
              disabled={loading}
              sx={{ bgcolor: "background.default" }}
            >
              <MenuItem value="newest">Năm (Mới nhất)</MenuItem>
              <MenuItem value="oldest">Năm (Cũ nhất)</MenuItem>
              <MenuItem value="most_viewed">Views (Cao nhất)</MenuItem>
              <MenuItem value="least_viewed">Views (Thấp nhất)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Hàng 2: Range Filters */}
      <Grid container spacing={3} alignItems="flex-end">
        <Grid item xs={12} md={5}>
          <RangeInput
            label="Năm phát hành"
            minVal={filters.minYear}
            maxVal={filters.maxYear}
            onMinChange={(val) => onUpdate("minYear", val)}
            onMaxChange={(val) => onUpdate("maxYear", val)}
            placeholderMin="Từ (2000)"
            placeholderMax="Đến (2025)"
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <RangeInput
            label="Lượt xem"
            minVal={filters.minView}
            maxVal={filters.maxView}
            onMinChange={(val) => onUpdate("minView", val)}
            onMaxChange={(val) => onUpdate("maxView", val)}
            placeholderMin="Min View"
            placeholderMax="Max View"
            disabled={loading}
          />
        </Grid>

        {/* Reset Button */}
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            disabled={loading}
            sx={{ height: 40, fontWeight: "bold" }}
          >
            Reset All
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

// Sub-component
function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <FormControl fullWidth size="small">
      <Typography variant="overline" color="text.secondary" fontWeight="bold">
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        sx={{ bgcolor: "background.default" }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function RangeInput({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
  disabled
}) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" fontWeight="bold">
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          type="number"
          size="small"
          placeholder={placeholderMin}
          value={minVal}
          onChange={(e) => onMinChange(e.target.value)}
          disabled={disabled}
          fullWidth
          sx={{ bgcolor: "background.default" }}
        />
        <Typography color="text.secondary">-</Typography>
        <TextField
          type="number"
          size="small"
          placeholder={placeholderMax}
          value={maxVal}
          onChange={(e) => onMaxChange(e.target.value)}
          disabled={disabled}
          fullWidth
          sx={{ bgcolor: "background.default" }}
        />
      </Box>
    </Box>
  );
}
