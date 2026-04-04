"use client";

import Link from "next/link";
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function AnimeCard({ item }) {
  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/anime/${item.id}`}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* Thumbnail bằng Tailwind để ép 100% tỷ lệ chuẩn */}
        <div className="relative w-full bg-gray-200 aspect-[3/4]">
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Badge Studio */}
          {item.studios?.[0] && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
              {item.studios[0].name}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            p: 1.5,
            width: "100%",
            "&:last-child": { pb: 1.5 },
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            align="center"
            title={item.title}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </Typography>

          {/* Metadata Footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto", width: "100%" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {item.releaseYear?.name || item.release_year}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <VisibilityIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {new Intl.NumberFormat("en-US", { notation: "compact" }).format(item.views)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
