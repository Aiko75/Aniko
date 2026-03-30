"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { useMode } from "@/context/ModeContext";
import GameCard from "@/components/game/GameCard"; // Import component con

export default function GameList() {
  const router = useRouter();
  const { mode } = useMode();

  // --- CẤU HÌNH DATA (Icon đã được đưa trực tiếp vào đây) ---
  const gamesData = [
    {
      path: "/game/wordle",
      status: "active",
      color: "primary",
      localKey: LOCAL_STORAGE_KEYS.WORDLE.PROGRESS,
      modes: {
        hanime: {
          id: "hanidle",
          name: "H-Anidle",
          description:
            "Thử thách kiến thức văn hóa 'nhật bản'. Đoán tên phim dựa trên gợi ý.",
          icon: "🧩",
        },
        anime: {
          id: "anidle",
          name: "Anidle",
          description: "Thử thách fan cứng Anime. Đoán tên bộ Anime kinh điển.",
          icon: "🎬",
        },
      },
    },
    // {
    //   path: "/game/contexto",
    //   status: "active",
    //   color: "info",
    //   localKey: LOCAL_STORAGE_KEYS.CONTEXTO.PROGRESS,
    //   modes: {
    //     hanime: {
    //       id: "hentexto",
    //       name: "HenTexto",
    //       description:
    //         "Contexto phiên bản HAnime. Tìm ra bộ phim bí ẩn qua sự tương đồng.",
    //       icon: "🐈‍⬛",
    //     },
    //     anime: {
    //       id: "anitexto",
    //       name: "AniTexto",
    //       description:
    //         "Contexto phiên bản Anime. AI sẽ chỉ dẫn bạn đến bộ Anime bí mật.",
    //       icon: "🤖", // Đã thay thế "robot" bằng Emoji
    //     },
    //   },
    // },
    {
      path: "/game/tictactoe",
      status: "active",
      color: "success",
      localKey: LOCAL_STORAGE_KEYS.TICTACTOE.PROGRESS,
      modes: {
        hanime: {
          id: "hengrid",
          name: "HenGrid",
          description:
            "Immaculate Grid phiên bản người lớn. Điền vào ô trống theo tiêu chí.",
          icon: "👅",
        },
        anime: {
          id: "anigrid",
          name: "AniGrid",
          description:
            "Thử thách kiến thức tổng hợp. Tìm Anime thỏa mãn 2 điều kiện giao nhau.",
          icon: "🧠", // Đã thay thế "wk" bằng Emoji
        },
      },
    },
    {
      path: "/game/bingo",
      status: "active",
      color: "danger",
      localKey: LOCAL_STORAGE_KEYS.BINGO.PROGRESS,
      modes: {
        hanime: {
          id: "hengo",
          name: "Hengo",
          description:
            "Bingo phiên bản HAnime. Quay số và tìm vận may của bạn.",
          icon: "🥀",
        },
        anime: {
          id: "anibingo",
          name: "AniBingo",
          description:
            "Bingo Anime vui vẻ. Sưu tập các waifu/husbando để chiến thắng.",
          icon: "🍀", // Đã thay thế "ix" bằng Emoji
        },
      },
    },
    {
      path: "/game/anirank",
      status: "active",
      color: "warning",
      localKey: null,
      modes: {
        anime: {
          id: "anirank",
          name: "AniRank",
          description:
            "Tenaball phiên bản Anime. Trả lời câu hỏi về top anime theo thể loại, studio, năm!",
          icon: "🏆",
        },
      },
    },
  ];

  // --- LOGIC ĐIỀU HƯỚNG ---
  const handleGameNavigation = (gameCommon, gameModeData) => {
    if (gameCommon.status !== "active") return;

    if (gameCommon.localKey) {
      localStorage.removeItem(gameCommon.localKey);
      console.log(`🧹 IT Ops: Đã dọn dẹp [${gameCommon.localKey}]`);
    }

    router.push(gameCommon.path);
  };

  // --- UI THEME ---
  const bgTheme =
    mode === "hanime"
      ? "linear-gradient(to bottom right, #2c001e, #53183b)"
      : "linear-gradient(to bottom right, #141E30, #243B55)";

  return (
    <div
      className="py-5 transition-all duration-500 min-vh-100 w-100"
      style={{
        background: bgTheme,
        color: "white",
        transition: "background 0.5s ease",
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="mb-5 d-flex align-items-center animate-in fade-in justify-content-between">
          <div className="d-flex align-items-center">
            <Link
              href="/"
              className="px-3 btn btn-outline-light btn-sm rounded-pill me-3"
            >
              &larr; Home
            </Link>
            <div>
              <h1 className="mb-0 fw-bold">
                Game Center {mode === "hanime" ? "🔞" : "🎮"}
              </h1>
              <p className="mb-0 text-white-50">
                {mode === "hanime"
                  ? "Khu vực giải trí dành cho người trên 18 tuổi."
                  : "Thử thách kiến thức Anime của bạn."}
              </p>
            </div>
          </div>
        </div>

        {/* Game Grid - Sử dụng Component Con */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {gamesData.map((game, index) => {
            // Lấy data cụ thể theo mode
            const currentData = game.modes[mode];

            return (
              <GameCard
                key={currentData.id || index}
                gameCommon={game}
                gameData={currentData}
                currentMode={mode}
                onNavigate={handleGameNavigation}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
