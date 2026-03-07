'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Button,
  Card,
  ErrorMsg,
  Form,
  Input,
  Subtitle,
  Title,
  Wrapper,
} from './page.styles';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const from =
        typeof window !== 'undefined'
          ? (new URLSearchParams(window.location.search).get('from') ?? '/')
          : '/';
      router.replace(from);
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <Wrapper>
      <Card>
        <div>
          <Title>nook</Title>
          <Subtitle>tu inventario del hogar</Subtitle>
        </div>
        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <Button type="submit" disabled={loading || !password}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </Form>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>
    </Wrapper>
  );
}
