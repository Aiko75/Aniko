"use client";
import AnimeCard from "@/components/ui/AnimeCard";
import { Box, Grid, Pagination, Typography, Paper } from "@mui/material";

export default function AnimeGrid({
  data,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}) {
  // --- UI KHI KHÔNG CÓ DỮ LIỆU ---
  if (!isLoading && data.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          py: 10,
          textAlign: "center",
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.default",
        }}
      >
        <Typography color="text.secondary">
          Không tìm thấy bộ nào phù hợp với bộ lọc hiện tại.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box width="100%">
      {/* --- GRID LIST BẰNG TAILWIND --- */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
        {data.map((item, index) => (
          <div key={item.id || index}>
            <AnimeCard item={item} />
          </div>
        ))}
      </div>

      {/* --- PAGINATION (MUI STYLE) --- */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={6} mb={8}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => onPageChange(value)}
            color="primary"
            size="large"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
