import React from "react";
export default function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

