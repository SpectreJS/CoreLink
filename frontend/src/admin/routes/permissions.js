const rolePaths = {
  admin: ['/admin'],
  manager: ['/admin/dashboard', '/admin/parcels', '/admin/customers', '/admin/tracking', '/admin/shipments', '/admin/invoices', '/admin/payments', '/admin/reports'],
  operator: ['/admin/dashboard', '/admin/parcels', '/admin/customers', '/admin/tracking', '/admin/shipments'],
  viewer: ['/admin/dashboard', '/admin/parcels', '/admin/reports'],
};

export function canAccessAdminPath(role, pathname) {
  return (rolePaths[role] || []).some((basePath) => (
    basePath === '/admin' || pathname === basePath || pathname.startsWith(`${basePath}/`)
  ));
}

export function getAdminNavigationLinks(role, links) {
  return links.filter(([path]) => canAccessAdminPath(role, `/admin/${path}`));
}
