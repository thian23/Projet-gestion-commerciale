<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260511153356 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE product_lot (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, quantite INT NOT NULL, prix DOUBLE PRECISION NOT NULL, product_id INT DEFAULT NULL, INDEX IDX_EBAE7D044584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE product_lot ADD CONSTRAINT FK_EBAE7D044584665A FOREIGN KEY (product_id) REFERENCES product (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE product_lot DROP FOREIGN KEY FK_EBAE7D044584665A');
        $this->addSql('DROP TABLE product_lot');
    }
}
