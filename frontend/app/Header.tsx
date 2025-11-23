'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Marcar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  return (
    <header style={{ borderBottom: '1px solid #9e9e9eff' }} className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <a href="/" className="cursor-pointer">
              <img
                src="images/logo.png"
                alt="Zentricx"
                style={{ height: '46px', width: 'auto' }}
                className="inline-block align-middle"
              />
            </a>
          </div>
          {isClient && (
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900">
                {currentDateTime.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-base text-gray-600">
                {currentDateTime.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}