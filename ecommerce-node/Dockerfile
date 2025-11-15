# Stage 1: build the node
FROM docker.io/paritytech/ci-unified:latest as builder

WORKDIR /ecommerce-node
COPY . /ecommerce-node

# Optionally check Rust version
RUN rustc --version

RUN cargo fetch
RUN cargo build --locked --release

# Stage 2: runtime image
FROM docker.io/parity/base-bin:latest

COPY --from=builder /ecommerce-node/target/release/ecommerce-chain-node /usr/local/bin

USER root
RUN useradd -m -u 1001 -U -s /bin/sh -d /ecommerce-node polkadot && \
    mkdir -p /data /ecommerce-node/.local/share && \
    chown -R polkadot:polkadot /data && \
    ln -s /data /ecommerce-node/.local/share/polkadot && \
    rm -rf /usr/bin /usr/sbin

USER polkadot

EXPOSE 30333 9933 9944
VOLUME ["/data"]

ENTRYPOINT ["/usr/local/bin/ecommerce-chain-node"]