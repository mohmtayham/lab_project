export type AuthJwtPayload = {
  sub: number;
};

/** Shape attached to `req.user` after JWT validation. */
export interface CurrentUserData {
  id: number;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}
