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

# 设置 PORT 环境变量
ENV PORT=3001

EXPOSE 3001

CMD ["node", "backend/server.js"]