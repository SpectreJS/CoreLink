import React from 'react';
import { Link, matchRoutes, useLocation } from 'react-router-dom';
import { adminRouteConfig } from '../../routes/adminRouteConfig.js';

export default function AdminBreadcrumb() {
  const { pathname } = useLocation();
  const matches = matchRoutes(adminRouteConfig, pathname) || [];
  const crumbs = matches
    .map(({ route, params }) => {
      if (!route.handle) return null;
      const label = typeof route.handle.label === 'function'
        ? route.handle.label(params)
        : route.handle.label;
      return { label, to: route.handle.to };
    })
    .filter(Boolean);

  if (!crumbs.length || crumbs[0].label === 'Dashboard') {
    return (
      <nav aria-label="Fil d’Ariane" className="admin-breadcrumb">
        <span className="is-current">Dashboard</span>
      </nav>
    );
  }

  const dashboard = { label: 'Dashboard', to: '/admin/dashboard' };
  const items = [dashboard, ...crumbs];
  return (
    <nav aria-label="Fil d’Ariane" className="admin-breadcrumb">
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        return (
          <React.Fragment key={`${item.to || item.label}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {isCurrent || !item.to
              ? <span className="is-current">{item.label}</span>
              : <Link to={item.to}>{item.label}</Link>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
