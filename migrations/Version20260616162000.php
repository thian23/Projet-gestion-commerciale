<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260616162000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Align SenBazar domain model with sellers, payments and missing catalogue fields.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE orders SET status = 'payee' WHERE status = 'payer'");
        $this->addSql("UPDATE orders SET status = 'expediee' WHERE status = 'expedier'");
        $this->addSql("UPDATE orders SET status = 'annulee' WHERE status = 'annuler'");
        $this->addSql('CREATE TABLE vendeur (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, nom_boutique VARCHAR(150) NOT NULL, description LONGTEXT DEFAULT NULL, logo VARCHAR(255) DEFAULT NULL, statut VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_6CE3AFDA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE paiement (id INT AUTO_INCREMENT NOT NULL, commande_id INT NOT NULL, montant DOUBLE PRECISION NOT NULL, moyen_paiement VARCHAR(50) NOT NULL, statut VARCHAR(255) NOT NULL, date_paiement DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', identifiant_transaction VARCHAR(120) DEFAULT NULL, UNIQUE INDEX UNIQ_B1DC7A1E82EA2E54 (commande_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE vendeur ADD CONSTRAINT FK_6CE3AFDA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE paiement ADD CONSTRAINT FK_B1DC7A1E82EA2E54 FOREIGN KEY (commande_id) REFERENCES orders (id)');
        $this->addSql('ALTER TABLE category ADD description LONGTEXT DEFAULT NULL, ADD image VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE cart ADD date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE product ADD vendeur_id INT DEFAULT NULL, ADD note_moyenne DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_D34A04ADBB4F7C9B ON product (vendeur_id)');
        $this->addSql('ALTER TABLE product ADD CONSTRAINT FK_D34A04ADBB4F7C9B FOREIGN KEY (vendeur_id) REFERENCES vendeur (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE orders SET status = 'payer' WHERE status = 'payee'");
        $this->addSql("UPDATE orders SET status = 'expedier' WHERE status = 'expediee'");
        $this->addSql("UPDATE orders SET status = 'annuler' WHERE status = 'annulee'");
        $this->addSql('ALTER TABLE product DROP FOREIGN KEY FK_D34A04ADBB4F7C9B');
        $this->addSql('ALTER TABLE paiement DROP FOREIGN KEY FK_B1DC7A1E82EA2E54');
        $this->addSql('ALTER TABLE vendeur DROP FOREIGN KEY FK_6CE3AFDA76ED395');
        $this->addSql('DROP TABLE paiement');
        $this->addSql('DROP TABLE vendeur');
        $this->addSql('DROP INDEX IDX_D34A04ADBB4F7C9B ON product');
        $this->addSql('ALTER TABLE product DROP vendeur_id, DROP note_moyenne');
        $this->addSql('ALTER TABLE cart DROP date_ajout');
        $this->addSql('ALTER TABLE category DROP description, DROP image');
    }
}
