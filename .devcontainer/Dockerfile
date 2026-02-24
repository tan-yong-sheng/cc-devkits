# Use official devcontainer Python base
FROM mcr.microsoft.com/devcontainers/python:3.11

# Install curl (usually already installed, but safe)
RUN apt-get update && apt-get install -y curl

# Install Claude Code
RUN curl -fsSL https://claude.ai/install.sh | bash

# Ensure ~/.local/bin is in PATH for all users
ENV PATH="/root/.local/bin:${PATH}"