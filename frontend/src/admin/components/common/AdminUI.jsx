import React from 'react';
import { Link } from 'react-router-dom';

export function AdminButton({ children, className = '', to, type = 'button', ...props }) {
  const classes = `admin-button ${className}`.trim();
  return to
    ? <Link className={classes} to={to} {...props}>{children}</Link>
    : <button className={classes} type={type} {...props}>{children}</button>;
}

export function AdminBadge({ children, tone = '' }) {
  return <span className={`admin-badge ${tone ? `is-${tone}` : ''}`.trim()}>{children}</span>;
}

export function AdminTable({ columns, rows, emptyMessage = 'Aucune donnée à afficher.' }) {
  if (!rows.length) return <div className="admin-empty-state">{emptyMessage}</div>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminField({ label, as: Element = 'input', ...props }) {
  return <label className="admin-field">{label}<Element {...props} /></label>;
}

export function AdminLoader({ label = 'Chargement…' }) {
  return <div aria-live="polite" className="admin-loading-state">{label}</div>;
}

export function AdminPagination({ page = 1, pages = 1 }) {
  return <div aria-label="Pagination" className="admin-card-header"><span>Page {page} sur {pages}</span></div>;
}

export function AdminModal({ title, children, onClose }) {
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section aria-modal="true" className="admin-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog">
        <div className="admin-card-header"><h2>{title}</h2><button aria-label="Fermer" className="admin-icon-button" onClick={onClose} type="button">×</button></div>
        <div className="admin-card-body">{children}</div>
      </section>
    </div>
  );
}
