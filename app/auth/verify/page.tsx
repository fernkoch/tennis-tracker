import { redirect } from 'next/navigation';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;

  if (!token) {
    redirect('/signin?error=Invalid token');
  }

  try {
    // Call the verify API route
    const response = await fetch(`/api/auth/verify?token=${token}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      redirect(`/signin?error=${error.error || 'Verification failed'}`);
    }

    // If successful, the API will set the cookie and redirect to dashboard
    redirect('/dashboard');
  } catch (error) {
    redirect('/signin?error=Verification failed');
  }
} 