import { useState } from 'react';

// 将来的には実際の認証情報から権限を決定する
// 今はモックとして 'admin' または 'viewer' を返す
export type UserRole = 'admin' | 'viewer';

export const useAuthorization = () => {
  // 開発環境では admin 権限を付与
  // 本番環境では Clerk などの認証情報から取得
  const [role] = useState<UserRole>('admin');

  return {
    role,
    canEdit: role === 'admin',
    canDelete: role === 'admin',
    canCreate: role === 'admin',
  };
};