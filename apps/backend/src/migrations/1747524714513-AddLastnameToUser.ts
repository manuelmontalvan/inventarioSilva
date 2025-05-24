import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastnameToUser1747524714513 implements MigrationInterface {
    name = 'AddLastnameToUser1747524714513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "lastname" character varying `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastname"`);
    }

}
