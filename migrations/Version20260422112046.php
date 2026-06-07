<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260422112046 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE cart (id INT AUTO_INCREMENT NOT NULL, quantity INT NOT NULL, user_id INT DEFAULT NULL, product_id INT DEFAULT NULL, INDEX IDX_BA388B7A76ED395 (user_id), INDEX IDX_BA388B74584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE order_item (id INT AUTO_INCREMENT NOT NULL, quantity INT NOT NULL, price DOUBLE PRECISION NOT NULL, product_name VARCHAR(255) NOT NULL, order_id INT DEFAULT NULL, product_id INT DEFAULT NULL, INDEX IDX_52EA1F098D9F6D38 (order_id), INDEX IDX_52EA1F094584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE orders (id INT AUTO_INCREMENT NOT NULL, total DOUBLE PRECISION NOT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', tracking_number VARCHAR(100) DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_E52FFDEEA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE product (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, prix DOUBLE PRECISION NOT NULL, stock INT NOT NULL, image VARCHAR(255) NOT NULL, nouveaute TINYINT(1) NOT NULL, promotion TINYINT(1) NOT NULL, best_seller TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', category_id INT DEFAULT NULL, INDEX IDX_D34A04AD12469DE2 (category_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, telephone VARCHAR(20) NOT NULL, adresse VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE cart ADD CONSTRAINT FK_BA388B7A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE cart ADD CONSTRAINT FK_BA388B74584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F098D9F6D38 FOREIGN KEY (order_id) REFERENCES orders (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F094584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT FK_E52FFDEEA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE product ADD CONSTRAINT FK_D34A04AD12469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        $this->addSql('SET FOREIGN_KEY_CHECKS=0');
        $this->addSql('DROP TABLE IF EXISTS article');
        $this->addSql('DROP TABLE IF EXISTS categorie');
        $this->addSql('DROP TABLE IF EXISTS commande');
        $this->addSql('DROP TABLE IF EXISTS commande_articles');
        $this->addSql('DROP TABLE IF EXISTS panier');
        $this->addSql('DROP TABLE IF EXISTS panier_articles');
        $this->addSql('DROP TABLE IF EXISTS panier_item');
        $this->addSql('DROP TABLE IF EXISTS panier_items');
        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE TABLE article (id BIGINT AUTO_INCREMENT NOT NULL, best_seller TINYINT(1) NOT NULL, description VARCHAR(255) DEFAULT NULL, image VARCHAR(255) DEFAULT NULL, nouveaute TINYINT(1) NOT NULL, prix DOUBLE PRECISION NOT NULL, promotion TINYINT(1) NOT NULL, stock INT NOT NULL, titre VARCHAR(255) DEFAULT NULL, categorie_id BIGINT DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, INDEX IDX_23A0E66BCF5E72D (categorie_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE categorie (id BIGINT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE commande (id BIGINT AUTO_INCREMENT NOT NULL, date_commande DATE DEFAULT NULL, total DOUBLE PRECISION NOT NULL, user_id BIGINT DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE commande_articles (commande_id BIGINT NOT NULL, articles_id BIGINT NOT NULL)');
        $this->addSql('CREATE INDEX IDX_69FD29F21EBAF6CC ON commande_articles (articles_id)');
        $this->addSql('CREATE INDEX IDX_69FD29F282EA2E54 ON commande_articles (commande_id)');
        $this->addSql('CREATE TABLE panier (id BIGINT AUTO_INCREMENT NOT NULL, user_id BIGINT DEFAULT NULL, UNIQUE INDEX uk767pcfa8di7lj52dlo5f2gs5p (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE panier_articles (panier_id BIGINT NOT NULL, articles_id BIGINT NOT NULL)');
        $this->addSql('CREATE UNIQUE INDEX uk64w7r1yx3jjbj45qnj7snbqdm ON panier_articles (articles_id)');
        $this->addSql('CREATE INDEX IDX_2598381AF77D927C ON panier_articles (panier_id)');
        $this->addSql('CREATE TABLE panier_item (id BIGINT AUTO_INCREMENT NOT NULL, prix_unitaire DOUBLE PRECISION NOT NULL, quantity INT NOT NULL, article_id BIGINT DEFAULT NULL, INDEX IDX_EBFD00677294869C (article_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE panier_items (panier_id BIGINT NOT NULL, items_id BIGINT NOT NULL)');
        $this->addSql('CREATE UNIQUE INDEX ukadu2svvhk4qivh7ovh09q5no7 ON panier_items (items_id)');
        $this->addSql('CREATE INDEX IDX_C833C6F0F77D927C ON panier_items (panier_id)');
        $this->addSql('ALTER TABLE article ADD CONSTRAINT fkqnmbf0yfa804hxcw8c9gneb0v FOREIGN KEY (categorie_id) REFERENCES categorie (id)');
        $this->addSql('ALTER TABLE commande_articles ADD CONSTRAINT fkpadk79akt249p0k457au3poj6 FOREIGN KEY (articles_id) REFERENCES article (id)');
        $this->addSql('ALTER TABLE commande_articles ADD CONSTRAINT fktfdwft2lut05aiin013ig3cne FOREIGN KEY (commande_id) REFERENCES commande (id)');
        $this->addSql('ALTER TABLE panier_articles ADD CONSTRAINT fk7gbnkjky4b1vc3fdoiek2mkt1 FOREIGN KEY (panier_id) REFERENCES panier (id)');
        $this->addSql('ALTER TABLE panier_articles ADD CONSTRAINT fknu1xjot1gg5j850063d32w68q FOREIGN KEY (articles_id) REFERENCES article (id)');
        $this->addSql('ALTER TABLE panier_item ADD CONSTRAINT fkefyhmjjm3qd6opt83hxfvdarr FOREIGN KEY (article_id) REFERENCES article (id)');
        $this->addSql('ALTER TABLE panier_items ADD CONSTRAINT fki6cr0jqy8qb6f608p9sd1xmp9 FOREIGN KEY (items_id) REFERENCES panier_item (id)');
        $this->addSql('ALTER TABLE panier_items ADD CONSTRAINT fk4wo7gkp5wni8csgaw8yvpkcqb FOREIGN KEY (panier_id) REFERENCES panier (id)');
        $this->addSql('ALTER TABLE cart DROP FOREIGN KEY FK_BA388B7A76ED395');
        $this->addSql('ALTER TABLE cart DROP FOREIGN KEY FK_BA388B74584665A');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F098D9F6D38');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F094584665A');
        $this->addSql('ALTER TABLE orders DROP FOREIGN KEY FK_E52FFDEEA76ED395');
        $this->addSql('ALTER TABLE product DROP FOREIGN KEY FK_D34A04AD12469DE2');
        $this->addSql('DROP TABLE cart');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE order_item');
        $this->addSql('DROP TABLE orders');
        $this->addSql('DROP TABLE product');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
