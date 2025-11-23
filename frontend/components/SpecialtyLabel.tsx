import React from 'react';

interface SpecialtyLabelProps {
  specialty: string | { id: string; name: string } | undefined;
}

export default function SpecialtyLabel({ specialty }: Readonly<SpecialtyLabelProps>) {
  if (!specialty) return null;
  if (typeof specialty === 'string') return <span>• {specialty}</span>;
  return <span>• {specialty.name}</span>;
}
