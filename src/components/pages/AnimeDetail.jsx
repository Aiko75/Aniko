"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api/baseJsonApi";
import AnimeDetailSkeleton from "@/components/ui/AnimeDetailSkeleton";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Card,
  CardMedia,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function Detail() {
  const params = useParams();
  const slugId = params?.slugId;

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slugId) return;

    const fetchDetail = async () => {
      try {
        const json = await api.get(`/api/data/detail/${slugId}`);
        if (json.success) {
          setAnime(json.data);
        } else {
          setError(json.message || "Không tìm thấy anime này.");
        }
      } catch (err) {
        setError("Lỗi kết nối server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slugId]);

  // --- TRẠNG THÁI LOADING / ERROR ---
  if (loading) {
    return <AnimeDetailSkeleton />;
  }

  if (error || !anime) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
      >
        <Typography variant="h4" color="error.main" mb={3} display="flex" alignItems="center" gap={1}>
          <WarningAmberIcon fontSize="large" /> {error}
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: "20px" }}
        >
          Quay lại trang chủ
        </Button>
      </Box>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <Box sx={{ py: 6, bgcolor: "grey.50", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Breadcrumb / Back Button */}
        <Box mb={4}>
          <Button
            component={Link}
            href="/list"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: "20px", textTransform: "none", color: "text.secondary", borderColor: "divider" }}
          >
            Thư viện
          </Button>
        </Box>

        <Grid container spacing={6}>
          {/* CỘT TRÁI: ẢNH & NÚT HÀNH ĐỘNG */}
          <Grid item xs={12} md={4} lg={3}>
            <Card elevation={4} sx={{ borderRadius: 4, overflow: "hidden", mb: 3 }}>
              <CardMedia
                component="img"
                image={anime.thumbnail}
                alt={anime.title}
                sx={{
                  width: "100%",
                  height: "auto",
                  minHeight: 400,
                  objectFit: "cover",
                }}
              />
            </Card>

            <Stack spacing={2}>
              <Button
                href={anime.url}
                target="_blank"
                rel="noreferrer"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                sx={{
                  borderRadius: "30px",
                  fontWeight: "bold",
                  py: 1.5,
                  boxShadow: 3,
                }}
              >
                Xem Phim Ngay
              </Button>
            </Stack>
          </Grid>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <Grid item xs={12} md={8} lg={9}>
            <Typography variant="h3" fontWeight="bold" mb={3} color="text.primary">
              {anime.title}
            </Typography>

            {/* Metadata Badges */}
            <Stack direction="row" flexWrap="wrap" gap={1.5} mb={4}>
              {anime.release_year && (
                <Chip
                  icon={<CalendarTodayIcon fontSize="small" />}
                  label={anime.release_year}
                  color="default"
                  sx={{ fontWeight: "medium" }}
                />
              )}
              <Chip
                icon={<VisibilityIcon fontSize="small" />}
                label={`${new Intl.NumberFormat().format(anime.views)} Views`}
                color="success"
                sx={{ fontWeight: "medium" }}
              />
              <Chip
                icon={<FingerprintIcon fontSize="small" />}
                label={`ID: ${anime.id}`}
                color="warning"
                sx={{ fontWeight: "medium" }}
              />
            </Stack>

            {/* Synopsis */}
            <Box mb={6}>
              <Typography
                variant="h6"
                fontWeight="bold"
                pb={1}
                mb={2}
                borderBottom="2px solid"
                borderColor="divider"
              >
                Nội dung
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
              >
                {anime.synopsis || "Chưa có mô tả cho bộ này."}
              </Typography>
            </Box>

            {/* Thông tin bảng */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" mb={2}>
                Thông tin khác
              </Typography>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ "& td": { borderBottom: "none", py: 1.5 } }}>
                      <TableCell sx={{ width: "25%", fontWeight: "bold", color: "text.secondary" }}>Studio:</TableCell>
                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {anime.studios?.map((s, i) => (
                            <Chip key={i} label={s.name} size="small" color="info" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ "& td": { borderBottom: "none", py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Thể loại:</TableCell>
                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {anime.genres?.map((g, i) => (
                            <Chip key={i} label={g.name} size="small" variant="filled" sx={{ bgcolor: "grey.200" }} />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ "& td": { borderBottom: "none", py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Censorship:</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>
                        {anime.raw_data.censorship || "Unknown"}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ "& td": { borderBottom: "none", py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>Ngày cập nhật:</TableCell>
                      <TableCell>
                        {new Date(anime.updated_at || anime.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
