import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: projectRoot,
  },
  // 强制所有 API 路由返回 UTF-8 编码，修复 Windows 客户端乱码问题
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
