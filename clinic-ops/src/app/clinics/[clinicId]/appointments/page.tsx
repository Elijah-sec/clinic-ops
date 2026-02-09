import AppointmentForm from './AppointmentForm';
import AppointmentListClient from './AppointmentListClient';

export default function AppointmentsPage({ params }: { params: { clinicId: string } }) {
  const { clinicId } = params;
  return (
    <div style={{ padding: 20 }}>
      <h1>Appointments</h1>
      <AppointmentForm clinicId={clinicId} onCreated={() => { /* noop; list will refetch via effect if needed */ }} />
      <AppointmentListClient clinicId={clinicId} />
    </div>
  );
}
