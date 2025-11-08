'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/hello')
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error('Error fetching hello:', error);
        setMessage('Error loading message');
      })
      .finally(() => {
        setLoading(false);
      });
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
