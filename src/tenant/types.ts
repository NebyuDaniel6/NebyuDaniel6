export interface TenantOrg {
  id: string;
  name: string;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  orgId: string;
  brandId: string;
  name: string;
  createdAt: string;
}
