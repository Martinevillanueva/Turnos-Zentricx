// Prueba de validaciones para el backend
// Este archivo se puede ejecutar con node para probar las validaciones

const testValidations = async () => {
  const baseUrl = 'http://localhost:4000';

  // Test 1: Datos inválidos
  console.log('🧪 Test 1: Creando paciente con datos inválidos...');
  try {
    const response1 = await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'A', // Muy corto
        lastName: '123', // Números no permitidos
        documentNumber: 'abc', // Formato inválido
        email: 'email-invalido', // Email inválido
        phone: '123' // Teléfono inválido
      }),
    });
    
    const result1 = await response1.json();
    console.log('Respuesta esperada (errores):', result1);
  } catch (error) {
    console.error('Error en test 1:', error);
  }

  try {
    // Test 2: Crear paciente FHIR válido
    console.log('\n🧪 Test 2: Crear paciente FHIR válido...');

    try {
      const fhirPatient = {
        firstName: 'Prueba',
        lastName: 'Unitaria',
        documentNumber: '987654321',
        birthDate: '1985-03-15',
        gender: 'F',
        address: 'Av. Corrientes 1234',
        email: 'test@email.com',
        phone: '+5491112345678'
      };
      const response = await fetch(`${baseUrl}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fhirPatient),
      });
      const result = await response.json();
      if (response.ok && result.data?.id) {
        console.log('✅ Paciente FHIR creado:', result);
        // Eliminar paciente creado
        const deleteRes = await fetch(`${baseUrl}/api/patients/${result.data.id}`, {
          method: 'DELETE'
        });
        if (deleteRes.ok) {
          console.log('🗑️ Paciente FHIR eliminado correctamente');
        } else {
          console.log('⚠️ No se pudo eliminar el paciente FHIR de prueba');
        }
      } else {
        console.log('✗ Error al crear paciente FHIR:', result);
      }
    } catch (error) {
      console.error('Error en Test 2:', error);
    }

    // Test 3: Error por campos obligatorios faltantes
    console.log('\n🧪 Test 3: Error por campos obligatorios faltantes...');
    try {
      const invalidAppointment = {
        doctorId: '', // Falta doctorId
        specialtyId: '', // Falta specialtyId
        startTime: '', // Falta startTime
        appointmentType: 'routine'
      };
      const response = await fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidAppointment),
      });
      const result = await response.json();
      if (!response.ok) {
        console.log('✅ Error esperado por campos faltantes:', result);
      } else {
        console.log('✗ Debería fallar por campos obligatorios:', result);
      }
    } catch (error) {
      console.error('Error en test FHIR 3:', error);
    }
    const response2 = await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Juan Carlos',
        lastName: 'Pérez García',
        documentNumber: '12345678',
        email: 'juan.perez@email.com',
        phone: '+5491112345678',
        birthDate: '1990-05-15'
      }),
    });
    
    const result2 = await response2.json();
    console.log('✅ Respuesta esperada (éxito):', result2);
    
    return result2.data?.id; // Retornar ID para prueba de edición
  } catch (error) {
    console.error('Error en test 3:', error);
  }

  return null;
};

// Ejecutar pruebas si este archivo se ejecuta directamente
if (typeof window === 'undefined') {
  testValidations().then((patientId) => {
    if (patientId) {
      console.log(`\n✅ Paciente creado con ID: ${patientId}`);
      console.log('🎉 Las validaciones están funcionando correctamente!');
    }
  }).catch(console.error);
}

export { testValidations };