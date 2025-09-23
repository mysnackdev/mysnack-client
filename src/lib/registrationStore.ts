export type RegData = {
  displayName?: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  password?: string;
  confirm?: string;
  marketingOptIn?: boolean;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

const KEY = "mysnack:regData";

export function loadReg(): RegData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as RegData : {};
  } catch { return {}; }
}

export function saveReg(partial: Partial<RegData>) {
  if (typeof window === 'undefined') return;
  const current = loadReg();
  const next = { ...current, ...partial };
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function clearReg() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
