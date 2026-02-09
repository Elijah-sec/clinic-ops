import AppointmentListClient from '../appointments/AppointmentListClient';

export default function DashboardPage({ params }: { params: { clinicId: string } }) {
  const { clinicId } = params;
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  return (
    <div style={{ padding: 20 }}>
      <h1>Today’s Appointments</h1>
      <AppointmentListClient clinicId={clinicId} date={today} />
    </div>
  );
}
