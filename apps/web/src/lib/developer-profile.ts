export const DEVELOPER_PROFILE_STORAGE_KEY = 'kitcode:developer-profile';

export type DeveloperProfileInput = {
  name: string;
  email: string;
  team: string;
  notes?: string;
  shareDataConsent: boolean;
};

export type DeveloperProfile = DeveloperProfileInput & {
  avatarInitials: string;
  registeredAt: string;
};

export function createAvatarInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'KC';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function createDeveloperProfile(input: DeveloperProfileInput): DeveloperProfile {
  const name = input.name.trim();
  const email = input.email.trim();
  const team = input.team.trim();
  const notes = input.notes?.trim();

  return {
    name,
    email,
    team,
    ...(notes ? {notes} : {}),
    shareDataConsent: input.shareDataConsent,
    avatarInitials: createAvatarInitials(name),
    registeredAt: new Date().toISOString(),
  };
}

export function readDeveloperProfile() {
  const storedProfile = window.sessionStorage.getItem(DEVELOPER_PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return null;
  }

  try {
    const profile = JSON.parse(storedProfile) as Partial<DeveloperProfile>;

    if (
      typeof profile.name !== 'string'
      || typeof profile.email !== 'string'
      || typeof profile.team !== 'string'
      || typeof profile.avatarInitials !== 'string'
      || typeof profile.registeredAt !== 'string'
    ) {
      return null;
    }

    return {
      ...profile,
      shareDataConsent: typeof profile.shareDataConsent === 'boolean'
        ? profile.shareDataConsent
        : false,
    } as DeveloperProfile;
  } catch {
    return null;
  }
}

export function writeDeveloperProfile(profile: DeveloperProfile) {
  window.sessionStorage.setItem(DEVELOPER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearDeveloperProfile() {
  window.sessionStorage.removeItem(DEVELOPER_PROFILE_STORAGE_KEY);
}
