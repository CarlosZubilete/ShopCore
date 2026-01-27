// Methods HTTP
export enum Method {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}
// Scopes for permissions
export enum Scope {
  Read = "read",
  Write = "write",
  Update = "update",
  Delete = "delete",
  UNKNOWN = "unknown",
}

export interface IPermission {
  method: Method;
  scope: Scope;
  permissions: string[];
}

// Permissions structure
export const permissions: IPermission[] = [
  {
    method: Method.GET,
    scope: Scope.Read,
    permissions: ["admin_granted"],
  },
  {
    method: Method.POST,
    scope: Scope.Write,
    permissions: ["admin_granted"],
  },
  {
    method: Method.PATCH,
    scope: Scope.Update,
    permissions: ["admin_granted"],
  },
  {
    method: Method.DELETE,
    scope: Scope.Delete,
    permissions: ["admin_granted"],
  },
];
