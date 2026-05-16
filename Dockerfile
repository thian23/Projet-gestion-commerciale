FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libzip-dev \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install intl pdo pdo_pgsql zip gd \
    && a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

RUN php bin/console cache:clear --env=prod || true

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 var

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

EXPOSE 80

CMD ["apache2-foreground"]