#!/bin/sh
set -e

if ! command -v envsubst > /dev/null 2>&1; then
    apk add --no-cache gettext
fi

if [ -f /etc/nginx/templates/default.conf.template ]; then
    envsubst '${NGINX_BASE_DOMAIN} ${NGINX_SERVER_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
    
    API_CERT="/etc/letsencrypt/live/api.${NGINX_BASE_DOMAIN}/fullchain.pem"
    ADMIN_CERT="/etc/letsencrypt/live/admin.${NGINX_BASE_DOMAIN}/fullchain.pem"
    
    if [ ! -f "$API_CERT" ] || [ ! -f "$ADMIN_CERT" ]; then
        echo "Warning: SSL certificates not found. Removing SSL server blocks..."
        awk '
        BEGIN { in_ssl_block = 0; brace_count = 0 }
        /^server {$/ {
            if (in_ssl_block == 0) {
                print
                getline
                if (/listen 443 ssl/) {
                    in_ssl_block = 1
                    brace_count = 1
                    next
                } else {
                    print
                }
            }
            next
        }
        in_ssl_block == 1 {
            if (/\{/) brace_count++
            if (/\}/) {
                brace_count--
                if (brace_count == 0) {
                    in_ssl_block = 0
                }
            }
            next
        }
        { print }
        ' /etc/nginx/conf.d/default.conf > /tmp/nginx.conf.tmp && mv /tmp/nginx.conf.tmp /etc/nginx/conf.d/default.conf
        echo "SSL server blocks removed. Nginx will work in HTTP-only mode until certificates are obtained."
    fi
fi

if [ -f /docker-entrypoint.sh ]; then
    exec /docker-entrypoint.sh nginx -g 'daemon off;'
else
    exec nginx -g 'daemon off;'
fi

