import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddFhirComplianceFields1732300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campos FHIR R4 faltantes
        
        // identifier - Identificador único externo
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'identifier',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'FHIR: External identifier for the appointment'
        }));

        // priority - Prioridad (0-9)
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'priority',
            type: 'integer',
            default: 5,
            comment: 'FHIR: Priority of the appointment (0=lowest, 9=highest)'
        }));

        // minutesDuration - Duración calculada automáticamente
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'minutes_duration',
            type: 'integer',
            isNullable: true,
            comment: 'FHIR: Duration in minutes (calculated from start/end)'
        }));

        // appointmentType - Tipo de cita
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'appointment_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'FHIR: Type of appointment (routine, emergency, follow-up, etc.)'
        }));

        // reasonCode - Razón codificada (ICD-10, SNOMED, etc.)
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'reason_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'FHIR: Coded reason for appointment (ICD-10, SNOMED)'
        }));

        // serviceCategory - Categoría del servicio
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'service_category',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'FHIR: Broad categorization of the service'
        }));

        // serviceType - Tipo específico de servicio
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'service_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'FHIR: Specific type of service'
        }));

        // patientInstruction - Instrucciones para el paciente
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'patient_instruction',
            type: 'text',
            isNullable: true,
            comment: 'FHIR: Detailed instructions for the patient'
        }));

        // slot reference - Referencia al slot de tiempo (si se usa sistema de slots)
        await queryRunner.addColumn('appointments', new TableColumn({
            name: 'slot_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'FHIR: Reference to time slot'
        }));

        // Renombrar cancellationReason para cumplir FHIR (ya existe pero validar nombre)
        // El campo ya existe como cancellationReason, solo agregar índice
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_appointments_identifier ON appointments(identifier)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_appointments_appointment_type ON appointments(appointment_type)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios
        await queryRunner.dropColumn('appointments', 'identifier');
        await queryRunner.dropColumn('appointments', 'priority');
        await queryRunner.dropColumn('appointments', 'minutes_duration');
        await queryRunner.dropColumn('appointments', 'appointment_type');
        await queryRunner.dropColumn('appointments', 'reason_code');
        await queryRunner.dropColumn('appointments', 'service_category');
        await queryRunner.dropColumn('appointments', 'service_type');
        await queryRunner.dropColumn('appointments', 'patient_instruction');
        await queryRunner.dropColumn('appointments', 'slot_id');
        
        await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_identifier`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_appointments_appointment_type`);
    }
}
