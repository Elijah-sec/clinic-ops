import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
      <div>
        <h1>Clinic Ops — Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
