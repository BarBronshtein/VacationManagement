FROM node:20-alpine AS development
WORKDIR /app
COPY vacation_frontend/package*.json ./
RUN npm i
COPY vacation_frontend/ .
EXPOSE 5173
# --host 0.0.0.0 exposes Vite dev server to the host machine
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]