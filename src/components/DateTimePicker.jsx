import React from "react";

export default function DateTimePicker({ value, onChange }) {
  return (
    <input
      type="datetime-local"
      className="modal-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
