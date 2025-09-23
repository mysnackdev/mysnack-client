import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';
import type { ClientProfileInput } from '@/@types/profile.types';

export class ProfileService {
  static async upsertClientProfile(input: ClientProfileInput): Promise<void> {
    const fn = httpsCallable(functions, 'upsertClientProfile');
    await fn(input);
  }
}
