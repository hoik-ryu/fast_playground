import { useMutation } from '@tanstack/react-query';

import { updateProfile } from '../api/updateProfile';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
  });
}
