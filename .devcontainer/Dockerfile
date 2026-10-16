FROM oven/bun@sha256:b86c67b531d87b4db11470d9b2bd0c519b1976eee6fcd71634e73abfa6230d2e

# Bun 1.3.10, pinned to the multi-platform image digest.

ARG CA_CERTIFICATES_VERSION=20250419
ARG GIT_VERSION=1:2.47.3-0+deb13u1
ARG GIT_LFS_VERSION=3.6.1-1+deb13u1
ARG OPENSSH_CLIENT_VERSION=1:10.0p1-7+deb13u4

USER root

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
        ca-certificates=${CA_CERTIFICATES_VERSION} \
        git=${GIT_VERSION} \
        git-lfs=${GIT_LFS_VERSION} \
        openssh-client=${OPENSSH_CLIENT_VERSION} \
    && rm -rf /var/lib/apt/lists/* \
    && git lfs install --system \
    && install -d -o bun -g bun \
        /workspace/kalka/node_modules \
        /workspace/kalka/packages/scene-graph/node_modules \
        /workspace/kalka/packages/pen/node_modules \
        /workspace/kalka/packages/kiwi/node_modules \
        /workspace/kalka/packages/fig/node_modules \
        /workspace/kalka/packages/core/node_modules \
        /workspace/kalka/packages/dom-css/node_modules \
        /workspace/kalka/packages/design-jsx/node_modules \
        /workspace/kalka/packages/emit/node_modules \
        /workspace/kalka/packages/vue/node_modules \
        /workspace/kalka/packages/cli/node_modules \
        /workspace/kalka/packages/mcp/node_modules \
        /workspace/kalka/packages/docs/node_modules \
        /workspace/kalka/tools/docs/node_modules

USER bun
