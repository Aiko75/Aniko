"use client";

import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function AnimeCardSkeleton() {
  return (
    <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      {/* Khung ảnh Thumbnail bằng Tailwind */}
      <div className="relative w-full aspect-[3/4]">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />
      </div>

      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 1.5, "&:last-child": { pb: 1.5 } }}>
        {/* Khung Tiêu đề */}
        <Box mb={2}>
          <Skeleton variant="text" animation="wave" height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" animation="wave" width="80%" height={20} sx={{ borderRadius: 1 }} />
        </Box>

        <Box mt="auto">
          {/* Khung Metadata (Năm & View) */}
          <Box display="flex" justifyContent="space-between">
            <Skeleton variant="text" animation="wave" width="30%" height={15} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" animation="wave" width="30%" height={15} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
