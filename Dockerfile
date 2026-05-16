FROM php:8.2-apache

# --------------------------------------------------
# Dépendances système + extensions PHP nécessaires
# --------------------------------------------------
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        intl \
        pdo \
        pdo_pgsql \
        zip \
        gd \
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------------------------
# Installation de Composer
# --------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# --------------------------------------------------
# Dossier de travail
# --------------------------------------------------
WORKDIR /var/www/html

# --------------------------------------------------
# Copie du projet
# --------------------------------------------------
COPY . .

# --------------------------------------------------
# Création des dossiers Symfony nécessaires
# (évite l'erreur "chmod: cannot access 'var'")
# --------------------------------------------------
RUN mkdir -p var/cache var/log public/uploads

# --------------------------------------------------
# Installation des dépendances PHP (prod)
# --no-scripts évite les erreurs DebugBundle
# --------------------------------------------------
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# --------------------------------------------------
# Nettoyage du cache Symfony
# --------------------------------------------------
RUN rm -rf var/cache/*

# --------------------------------------------------
# Permissions
# --------------------------------------------------
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 var public/uploads

# --------------------------------------------------
# Configuration Apache pour Symfony (/public)
# --------------------------------------------------
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

# --------------------------------------------------
# Render fournit automatiquement la variable PORT.
# Apache écoute par défaut sur 80, ce qui fonctionne.
# --------------------------------------------------
EXPOSE 80

# --------------------------------------------------
# Lancement du serveur Apache
# --------------------------------------------------
CMD ["apache2-foreground"]