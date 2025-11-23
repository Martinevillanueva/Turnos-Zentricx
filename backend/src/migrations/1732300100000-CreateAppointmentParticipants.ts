import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAppointmentParticipants1732300100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla de participantes según FHIR R4
        await queryRunner.createTable(new Table({
            name: 'appointment_participants',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    length: '36',
                    isPrimary: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'appointment_id',
                    type: 'varchar',
                    length: '36',
                    comment: 'Reference to appointment'
                },
                {
                    name: 'actor_type',
                    type: 'varchar',
                    length: '50',
                    comment: 'Type of participant: patient, practitioner, related-person, device, healthcare-service, location'
                },
                {
                    name: 'actor_id',
                    type: 'varchar',
                    length: '36',
                    comment: 'ID of the actor (patientId, doctorId, etc.)'
                },
                {
                    name: 'actor_display',
                    type: 'varchar',
                    length: '200',
                    isNullable: true,
                    comment: 'Display name for the actor'
                },
                {
                    name: 'required',
                    type: 'varchar',
                    length: '20',
                    default: "'required'",
                    comment: 'FHIR: required | optional | information-only'
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '20',
                    default: "'needs-action'",
                    comment: 'FHIR: accepted | declined | tentative | needs-action'
                },
                {
                    name: 'period_start',
                    type: 'datetime',
                    isNullable: true,
                    comment: 'Start time for this participant'
                },
                {
                    name: 'period_end',
                    type: 'datetime',
                    isNullable: true,
                    comment: 'End time for this participant'
                },
                {
                    name: 'created_at',
                    type: 'datetime',
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: 'updated_at',
                    type: 'datetime',
                    default: 'CURRENT_TIMESTAMP'
                }
            ]
        }), true);

        // Agregar foreign key al appointment
        await queryRunner.createForeignKey('appointment_participants', new TableForeignKey({
            columnNames: ['appointment_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'appointments',
            onDelete: 'CASCADE'
        }));

        // Crear índices
        await queryRunner.query(`CREATE INDEX idx_participants_appointment ON appointment_participants(appointment_id)`);
        await queryRunner.query(`CREATE INDEX idx_participants_actor ON appointment_participants(actor_type, actor_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('appointment_participants');
    }
}
