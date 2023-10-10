# ---------- Base ----------
FROM node:16 AS base
ENV CURRENT_ENV=PRODUCTION
WORKDIR /server

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS builder

COPY package*.json .babelrc ./

RUN npm install

COPY ./src ./src

RUN npm run build

RUN npm prune --production # Remove dev dependencies

# ---------- Release ----------
FROM base AS release

COPY --from=builder /server/node_modules ./node_modules
COPY --from=builder /server/dist ./dist

USER node

CMD ["node", "./dist/app.js"]