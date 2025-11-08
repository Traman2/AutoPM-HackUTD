'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHello = async () => {
      try {
        const response = await fetch('/api/hello');
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error fetching hello:', error);
        setMessage('Error loading message');
      } finally {
        setLoading(false);
      }
    };

    fetchHello();
  }, []);

  return (
    <div className="">
      <main className="">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <p>{message}</p>
        )}
      </main>
    </div>
  );
}
