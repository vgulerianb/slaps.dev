# syntax=docker/dockerfile:1
FROM rust:1.83-bookworm AS builder
WORKDIR /app
COPY Cargo.toml ./
COPY core ./core
COPY agent ./agent
RUN cargo build --release -p sandcastle-core

FROM node:20-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ca-certificates curl git jq sqlite3 \
    && rm -rf /var/lib/apt/lists/*
RUN ln -sf python3 /usr/bin/python
COPY --from=builder /app/target/release/sandcastle-core /usr/local/bin/sandcastle-core
ENV SANDCASTLE_DATA_DIR=/data
ENV SANDCASTLE_BIND=0.0.0.0:8787
ENV SANDCASTLE_API_KEYS=dev
EXPOSE 8787
VOLUME ["/data"]
CMD ["sandcastle-core"]
