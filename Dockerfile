# =========================
# Stage 1: Builder
# =========================
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source code
COPY . .

# =========================
# Stage 2: Runtime
# =========================
FROM node:22-slim AS runtime

WORKDIR /app

# Set timezone to UTC
ENV TZ=UTC

# Install system dependencies
RUN apt-get update && \
    apt-get install -y cron tzdata bash && \
    ln -snf /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Node.js dependencies and code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Secure private key
RUN chmod 600 student_private.pem

# Create cron directories and last_code.txt
RUN mkdir -p /data /cron && \
    chmod -R 755 /data /cron && \
    touch /cron/last_code.txt && chmod 666 /cron/last_code.txt

# Copy cron job
COPY cron/2fa-cron /etc/cron.d/totp-cron
RUN chmod 0644 /etc/cron.d/totp-cron && crontab /etc/cron.d/totp-cron

# Expose API port
EXPOSE 8080

# Start cron service + API
CMD ["sh", "-c", "cron && node server.js"]
