import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: React.ReactNode;
  className?: string;
}

export default function MetricCard({ title, value, trend, className }: MetricCardProps) {
  return (
    <div className={`card mb-3 h-100 ${className||''}`} style={{ backgroundColor: '#2D1B4E', borderColor: '#E91E63', color: '#E0E0E0' }}>
      <div className="card-body d-flex flex-column justify-content-between">
        <h6 className="card-title" style={{ color: '#FF69B4' }}>{title}</h6>
        <p className="card-text display-6 mb-0" style={{ color: '#E91E63' }}>{value}</p>
        {trend && <small style={{ color: '#00FF00' }}>{trend}</small>}
      </div>
    </div>
  );
}
