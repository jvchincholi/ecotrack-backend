import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToUsers1700000000001 implements MigrationInterface {
  name = 'AddPasswordToUsers1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add password column
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "password" character varying NOT NULL DEFAULT '';
    `);

    // Add lastLoginAt column
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP;
    `);

    // Remove the default empty string for passwords (only needed for migration)
    // In practice, all new users must provide a password
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "password" DROP DEFAULT;
    `);

    // Add a check constraint to ensure password is not empty
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "check_password_not_empty" 
      CHECK (LENGTH("password") > 0);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove check constraint
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT "check_password_not_empty";
    `);

    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "lastLoginAt";
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "password";
    `);
  }
}
