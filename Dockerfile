# 使用官方 Node.js 镜像
FROM node:18-slim

# 安装 build-essential 用于编译 native modules（如果有的话）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制所有源代码
COPY . .

# 安装依赖
RUN npm install

# 构建前端（如果需要）
# RUN npm run build

EXPOSE 3001

CMD ["node", "backend/server.js"]