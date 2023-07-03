# Radiolise environment configuration
# ===================================

# This file lets you customize the Radiolise instance you want to set up.
# Once done, run "source env.sh" and create the Docker containers using Compose.

# Build target. Default is "fullstack". Options are "fullstack"|"backend".
# If set to "backend", the build process for the frontend is omitted.
# You have to remove the static volume and rebuild containers for this to apply.
export RADIOLISE_BUILD_TARGET=

# Global options for the Caddy server (e.g. "debug").
# See <https://caddyserver.com/docs/caddyfile/options>.
export RADIOLISE_SERVER_OPTIONS=

# The Caddy address to use. Replace with your own domain and remove "http://".
# See <https://caddyserver.com/docs/caddyfile/concepts#addresses>.
export RADIOLISE_SITE_ADDRESS="http://localhost"

export RADIOLISE_HTTP_PORT="80"
export RADIOLISE_HTTPS_PORT="443"

# These two variables define Caddy standard matchers for frontend and backend.
# See <https://caddyserver.com/docs/caddyfile/matchers#standard-matchers>.
export RADIOLISE_FRONTEND_RULES=
export RADIOLISE_BACKEND_RULES=

# Uncomment these two lines to create a standalone API server without frontend.
# export RADIOLISE_BUILD_TARGET="backend"
# export RADIOLISE_FRONTEND_RULES="expression false"
