import PatientListClient from './PatientListClient';

export default function PatientsPage({ params }: { params: { clinicId: string } }) {
  const { clinicId } = params;
  return (
    <div style={{ padding: 20 }}>
      <h1>Patients</h1>
      <PatientListClient clinicId={clinicId} />
    </div>
  );
}
