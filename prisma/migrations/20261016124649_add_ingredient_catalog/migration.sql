/*
  Warnings:

  - You are about to drop the column `photo_public_id` on the `ingredients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ingredients` DROP COLUMN `photo_public_id`,
    ADD COLUMN `catalog_id` INTEGER NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `ingredient_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `photo_url` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `source_link` VARCHAR(500) NULL,
    `common_uses` JSON NULL,
    `allergy_potential` TEXT NULL,
    `skin_type_summary` TEXT NULL,
    `risk_benefit` TEXT NULL,
    `category` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ingredient_catalog_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ingredients` ADD CONSTRAINT `ingredients_catalog_id_fkey` FOREIGN KEY (`catalog_id`) REFERENCES `ingredient_catalog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
