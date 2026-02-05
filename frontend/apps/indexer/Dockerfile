FROM node:20-alpine

WORKDIR /app

# 1. Copy package file
COPY package.json ./

# 2. Use npm to create a standard, flat node_modules folder
# This avoids all the 'module not found' issues we had with pnpm
RUN npm install

# 3. Copy source code
COPY . .

# 4. Run directly with tsx (ESM + TypeScript support natively)
CMD ["npx", "tsx", "src/index.ts"]