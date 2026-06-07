<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260506114529 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE orders ADD payment_method VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE orders ADD guest_name VARCHAR(100) DEFAULT NULL');
        $this->addSql('ALTER TABLE orders ADD guest_phone VARCHAR(30) DEFAULT NULL');
        $this->addSql('ALTER TABLE orders ADD guest_address VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE orders DROP COLUMN payment_method');
        $this->addSql('ALTER TABLE orders DROP COLUMN guest_name');
        $this->addSql('ALTER TABLE orders DROP COLUMN guest_phone');
        $this->addSql('ALTER TABLE orders DROP COLUMN guest_address');
    }
}
