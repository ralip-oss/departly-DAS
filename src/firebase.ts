import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { TripEvent, UserProfile } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,32}$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_REGEX.test(username.trim());
}

function clampString(val: string | undefined, maxLen: number): string {
  return (val || '').trim().slice(0, maxLen);
}

function buildProfileDocData(uid: string, username: string, email: string, profile: UserProfile) {
  return {
    uid,
    username: clampString(username, 32),
    name: clampString(profile.name || username, 80),
    role: clampString(profile.role || 'Membro Departly', 60),
    email: clampString(email, 160),
    avatar: clampString(profile.avatar || '', 300),
    defaultBufferMin: Math.min(60, Math.max(1, Number(profile.defaultBufferMin) || 12)),
    primaryTransitMode: profile.primaryTransitMode || 'car',
    voiceTone: profile.voiceTone || 'Empathetic & Professional',
    autoSendDelayNotice: Boolean(profile.autoSendDelayNotice),
    soundAlerts: Boolean(profile.soundAlerts),
    hapticFeedback: Boolean(profile.hapticFeedback),
    themeMode: profile.themeMode || 'adaptive',
    language: profile.language || 'pt',
    timeOfDaySimulation: profile.timeOfDaySimulation || 'afternoon',
    gdprCompliantData: Boolean(profile.gdprCompliantData),
    endToEndEncryption: Boolean(profile.endToEndEncryption),
  };
}

export async function registerAccountWithUsername(params: {
  username: string;
  email: string;
  password: string;
  baseProfile: UserProfile;
}): Promise<{ user: User; profile: UserProfile }> {
  const cleanUsername = params.username.trim();
  const usernameLower = normalizeUsername(cleanUsername);
  const cleanEmail = params.email.trim();

  if (!isValidUsernameFormat(cleanUsername)) {
    throw new Error('INVALID_USERNAME');
  }

  // Verify username uniqueness before creating auth user
  const usernamePath = `usernames/${usernameLower}`;
  try {
    const existingSnap = await getDoc(doc(db, 'usernames', usernameLower));
    if (existingSnap.exists()) {
      throw new Error('USERNAME_TAKEN');
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'USERNAME_TAKEN') {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
      handleFirestoreError(err, OperationType.GET, usernamePath);
    }
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
  await updateProfile(cred.user, { displayName: cleanUsername });

  const newProfile: UserProfile = {
    ...params.baseProfile,
    uid: cred.user.uid,
    username: cleanUsername,
    name: cleanUsername,
    email: cleanEmail,
    role: 'Membro Departly',
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'users', cred.user.uid), {
    ...buildProfileDocData(cred.user.uid, cleanUsername, cleanEmail, newProfile),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, 'usernames', usernameLower), {
    uid: cred.user.uid,
    username: cleanUsername,
    email: cleanEmail,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${cred.user.uid}`);
  }

  return { user: cred.user, profile: newProfile };
}

export async function loginWithEmailOrUsername(params: {
  identifier: string;
  password: string;
}): Promise<User> {
  const raw = params.identifier.trim();
  let emailToSignIn = raw;

  if (!raw.includes('@')) {
    const usernameLower = normalizeUsername(raw);
    if (!isValidUsernameFormat(usernameLower)) {
      throw new Error('USER_NOT_FOUND');
    }
    const path = `usernames/${usernameLower}`;
    try {
      const snap = await getDoc(doc(db, 'usernames', usernameLower));
      if (!snap.exists()) {
        throw new Error('USER_NOT_FOUND');
      }
      const data = snap.data() as { email?: string };
      if (!data.email) {
        throw new Error('USER_NOT_FOUND');
      }
      emailToSignIn = data.email;
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        throw error;
      }
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  const cred = await signInWithEmailAndPassword(auth, emailToSignIn, params.password);
  return cred.user;
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export async function loadUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: data.uid,
      username: data.username,
      name: data.name || data.username || 'Utilizador Departly',
      role: data.role || 'Membro Departly',
      email: data.email || '',
      avatar: data.avatar || '',
      defaultBufferMin: typeof data.defaultBufferMin === 'number' ? data.defaultBufferMin : 12,
      primaryTransitMode: data.primaryTransitMode || 'car',
      voiceTone: data.voiceTone || 'Empathetic & Professional',
      autoSendDelayNotice: Boolean(data.autoSendDelayNotice),
      soundAlerts: data.soundAlerts !== false,
      hapticFeedback: data.hapticFeedback !== false,
      themeMode: data.themeMode || 'adaptive',
      theme: 'light',
      language: data.language || 'pt',
      timeOfDaySimulation: data.timeOfDaySimulation || 'afternoon',
      gdprCompliantData: data.gdprCompliantData !== false,
      endToEndEncryption: data.endToEndEncryption !== false,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateUserProfileInFirestore(
  uid: string,
  patch: Partial<UserProfile>
): Promise<void> {
  const path = `users/${uid}`;
  const allowedKeys = [
    'name',
    'role',
    'avatar',
    'defaultBufferMin',
    'primaryTransitMode',
    'voiceTone',
    'autoSendDelayNotice',
    'soundAlerts',
    'hapticFeedback',
    'themeMode',
    'language',
    'timeOfDaySimulation',
    'gdprCompliantData',
    'endToEndEncryption',
  ] as const;

  const cleanPatch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  for (const key of allowedKeys) {
    if (patch[key] !== undefined) {
      if (key === 'name') cleanPatch.name = clampString(String(patch.name), 80);
      else if (key === 'role') cleanPatch.role = clampString(String(patch.role), 60);
      else if (key === 'avatar') cleanPatch.avatar = clampString(String(patch.avatar), 300);
      else if (key === 'defaultBufferMin') {
        cleanPatch.defaultBufferMin = Math.min(60, Math.max(1, Number(patch.defaultBufferMin)));
      } else {
        cleanPatch[key] = patch[key];
      }
    }
  }

  try {
    await updateDoc(doc(db, 'users', uid), cleanPatch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

function serializeTripForFirestore(uid: string, trip: TripEvent) {
  const base: Record<string, unknown> = {
    id: clampString(trip.id, 128),
    userId: uid,
    title: clampString(trip.title, 120) || 'Compromisso',
    clientName: clampString(trip.clientName, 100) || 'Cliente',
    attendees: (trip.attendees || []).slice(0, 20).map((a) => ({
      name: clampString(a.name, 80),
      role: clampString(a.role, 60),
      email: clampString(a.email, 160),
      ...(a.phone ? { phone: clampString(a.phone, 40) } : {}),
    })),
    originAddress: clampString(trip.originAddress, 300) || 'Origem',
    destinationAddress: clampString(trip.destinationAddress, 300) || 'Destino',
    scheduledTime: clampString(trip.scheduledTime, 10) || '09:00',
    durationMin: Math.min(1440, Math.max(0, Number(trip.durationMin) || 60)),
    travelTimeMin: Math.min(1440, Math.max(0, Number(trip.travelTimeMin) || 0)),
    smartBufferMin: Math.min(120, Math.max(0, Number(trip.smartBufferMin) || 0)),
    departureTime: clampString(trip.departureTime, 10) || '08:30',
    trafficCondition: trip.trafficCondition || 'clear',
    status: trip.status || 'upcoming',
    calendarSource: trip.calendarSource || 'Google Calendar',
    calendarBlockInjected: Boolean(trip.calendarBlockInjected),
    transitMode: trip.transitMode || 'car',
    distanceKm: Math.min(10000, Math.max(0, Number(trip.distanceKm) || 0)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (trip.clientCompany) {
    base.clientCompany = clampString(trip.clientCompany, 100);
  }
  if (
    trip.originCoordinates &&
    typeof trip.originCoordinates.lat === 'number' &&
    typeof trip.originCoordinates.lng === 'number'
  ) {
    base.originCoordinates = {
      lat: trip.originCoordinates.lat,
      lng: trip.originCoordinates.lng,
    };
  }
  if (
    trip.destinationCoordinates &&
    typeof trip.destinationCoordinates.lat === 'number' &&
    typeof trip.destinationCoordinates.lng === 'number'
  ) {
    base.destinationCoordinates = {
      lat: trip.destinationCoordinates.lat,
      lng: trip.destinationCoordinates.lng,
    };
  }
  if (trip.notes) {
    base.notes = clampString(trip.notes, 500);
  }
  if (typeof trip.delayOffsetMin === 'number') {
    base.delayOffsetMin = Math.min(600, Math.max(0, trip.delayOffsetMin));
  }

  return base;
}

export async function saveTripToFirestore(uid: string, trip: TripEvent): Promise<void> {
  const path = `users/${uid}/trips/${trip.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'trips', trip.id), serializeTripForFirestore(uid, trip));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTripFieldsInFirestore(
  uid: string,
  tripId: string,
  patch: Partial<TripEvent>
): Promise<void> {
  const path = `users/${uid}/trips/${tripId}`;
  const cleanPatch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (patch.status !== undefined) cleanPatch.status = patch.status;
  if (patch.smartBufferMin !== undefined) {
    cleanPatch.smartBufferMin = Math.min(120, Math.max(0, Number(patch.smartBufferMin)));
  }
  if (patch.departureTime !== undefined) {
    cleanPatch.departureTime = clampString(patch.departureTime, 10);
  }
  if (patch.trafficCondition !== undefined) {
    cleanPatch.trafficCondition = patch.trafficCondition;
  }
  if (patch.delayOffsetMin !== undefined) {
    cleanPatch.delayOffsetMin = Math.min(600, Math.max(0, Number(patch.delayOffsetMin)));
  }
  if (patch.notes !== undefined) {
    cleanPatch.notes = clampString(patch.notes, 500);
  }

  try {
    await updateDoc(doc(db, 'users', uid, 'trips', tripId), cleanPatch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTripFromFirestore(uid: string, tripId: string): Promise<void> {
  const path = `users/${uid}/trips/${tripId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'trips', tripId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserTrips(
  uid: string,
  onTrips: (trips: TripEvent[]) => void
): () => void {
  const path = `users/${uid}/trips`;
  const q = query(collection(db, 'users', uid, 'trips'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const loaded: TripEvent[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          title: data.title || '',
          clientName: data.clientName || '',
          clientCompany: data.clientCompany,
          attendees: Array.isArray(data.attendees) ? data.attendees : [],
          originAddress: data.originAddress || '',
          destinationAddress: data.destinationAddress || '',
          originCoordinates: data.originCoordinates,
          destinationCoordinates: data.destinationCoordinates,
          scheduledTime: data.scheduledTime || '09:00',
          durationMin: typeof data.durationMin === 'number' ? data.durationMin : 60,
          travelTimeMin: typeof data.travelTimeMin === 'number' ? data.travelTimeMin : 0,
          smartBufferMin: typeof data.smartBufferMin === 'number' ? data.smartBufferMin : 10,
          departureTime: data.departureTime || '08:30',
          trafficCondition: data.trafficCondition || 'clear',
          status: data.status || 'upcoming',
          notes: data.notes,
          calendarSource: data.calendarSource || 'Google Calendar',
          calendarBlockInjected: Boolean(data.calendarBlockInjected),
          transitMode: data.transitMode || 'car',
          distanceKm: typeof data.distanceKm === 'number' ? data.distanceKm : 0,
          delayOffsetMin: data.delayOffsetMin,
        };
      });
      onTrips(loaded);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}