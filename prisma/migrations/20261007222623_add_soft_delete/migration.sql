-- AlterTable
ALTER TABLE `brands` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `deleted_at` DATETIME(3) NULL;
