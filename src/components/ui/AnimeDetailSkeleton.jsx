"use client";

import { Box, Container, Grid, Skeleton, Paper, Stack, Typography } from "@mui/material";

export default function AnimeDetailSkeleton() {
  return (
    <Box py={5} minHeight="100vh" bgcolor="background.default">
      <Container maxWidth="lg">
        {/* Breadcrumb / Back Button Skeleton */}
        <Box mb={4}>
          <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: "20px" }} />
        </Box>

        <Grid container spacing={5}>
          {/* CỘT TRÁI: ẢNH & NÚT SKELETON */}
          <Grid item xs={12} md={4} lg={3}>
            {/* Ảnh Cover */}
            <Paper elevation={3} sx={{ overflow: "hidden", borderRadius: 4, mb: 4 }}>
              <Skeleton variant="rectangular" width="100%" height={450} animation="wave" />
            </Paper>

            {/* Nút Xem Phim */}
            <Skeleton variant="rounded" width="100%" height={50} animation="wave" sx={{ borderRadius: "25px" }} />
          </Grid>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT SKELETON */}
          <Grid item xs={12} md={8} lg={9}>
            {/* Title */}
            <Skeleton variant="text" width="80%" height={60} animation="wave" sx={{ mb: 3 }} />

            {/* Metadata Badges */}
            <Stack direction="row" spacing={2} mb={4}>
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={100} height={32} />
            </Stack>

            {/* Synopsis */}
            <Box mb={5}>
              <Skeleton variant="text" width="30%" height={32} animation="wave" sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Skeleton variant="text" width="100%" animation="wave" />
                <Skeleton variant="text" width="100%" animation="wave" />
                <Skeleton variant="text" width="100%" animation="wave" />
                <Skeleton variant="text" width="80%" animation="wave" />
              </Stack>
            </Box>

            {/* Thông tin bảng */}
            <Box>
              <Skeleton variant="text" width="30%" height={32} animation="wave" sx={{ mb: 3 }} />

              <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
                <Stack spacing={3}>
                  {/* Row 1: Studio */}
                  <Stack direction="row" spacing={3}>
                    <Skeleton variant="text" width="20%" animation="wave" />
                    <Skeleton variant="text" width="30%" animation="wave" />
                  </Stack>
                  {/* Row 2: Thể loại */}
                  <Stack direction="row" spacing={3}>
                    <Skeleton variant="text" width="20%" animation="wave" />
                    <Stack direction="row" spacing={1} flexGrow={1}>
                      <Skeleton variant="rounded" width={60} height={24} />
                      <Skeleton variant="rounded" width={60} height={24} />
                      <Skeleton variant="rounded" width={80} height={24} />
                    </Stack>
                  </Stack>
                  {/* Row 3: Censorship */}
                  <Stack direction="row" spacing={3}>
                    <Skeleton variant="text" width="20%" animation="wave" />
                    <Skeleton variant="text" width="20%" animation="wave" />
                  </Stack>
                  {/* Row 4: Date */}
                  <Stack direction="row" spacing={3}>
                    <Skeleton variant="text" width="20%" animation="wave" />
                    <Skeleton variant="text" width="20%" animation="wave" />
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
