FROM composer:2 AS composer

FROM php:8.5.12-cli-bookworm@sha256:d4f6e10eb393de7e3a7a88e8b88e139072dd3ae297f6a5dada8257e6fe32c585

COPY docker/php-security.ini /usr/local/etc/php/conf.d/zz-synqo-security.ini
RUN php -r 'if (PHP_VERSION_ID < 80512 || ini_get("session.upload_progress.enabled") !== "0") { fwrite(STDERR, "Unsafe PHP runtime\n"); exit(1); }'

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libicu-dev libpq-dev libzip-dev \
    && docker-php-ext-install intl pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/local/bin/composer

WORKDIR /app

EXPOSE 8000
