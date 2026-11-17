# Departly Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched are denied by default (`match /{document=**} { allow read, write: if false; }`).
2. **User Profile Ownership**: `/users/{userId}` can only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid == userId`. `uid` and `createdAt` are immutable after creation, and `createdAt`/`updatedAt` must match `request.time`.
3. **Username Lookup Protection**: `/usernames/{usernameLower}` documents have strict lowercase IDs (`^[a-z0-9_\-]{3,32}$`). `allow list: if false;` prevents user enumeration. Creation requires authentication, matching `uid == request.auth.uid`, valid email, and server timestamp `createdAt == request.time`. Deletion is restricted to the owning `uid`. Updates are forbidden (`allow update: if false;`) to prevent username hijacking.
4. **Trip Master Gate & Ownership**: Every `/users/{userId}/trips/{tripId}` document belongs strictly to `{userId}` (`request.auth.uid == userId`), requires the parent `/users/{userId}` document to exist on create/update, validates `userId == request.auth.uid` on writes, and validates `resource.data.userId == request.auth.uid` on `list`.
5. **Bounded Arrays & Strict Shapes**: `attendees` is bounded (`size() <= 20`). Every string has explicit `.size()` bounds. No shadow/ghost fields are allowed (`hasAll` + `hasOnly` on create/validation, `affectedKeys().hasOnly(...)` on update).

## 2. Dirty Dozen Attack Payloads (Must Return PERMISSION_DENIED)
1. **Shadow/Ghost Field Injection on User Profile Create**: `{ ...validUser, isAdmin: true }`
2. **UID Spoofing on User Profile Create**: `{ ...validUser, uid: "other-user-uid" }`
3. **Client-Forged Timestamp on User Profile Create**: `{ ...validUser, createdAt: "2020-01-01T00:00:00Z" }`
4. **Cross-User PII Read on `/users/{otherUid}`**: `getDoc(doc(db, 'users', 'otherUid'))`
5. **Username Enumeration (`list` on `/usernames`)**: `getDocs(collection(db, 'usernames'))`
6. **Username Hijacking (`create` existing username or spoofed `uid`)**: `setDoc(doc(db, 'usernames', 'takenuser'), { uid: 'attacker', ... })`
7. **Username Mutate (`update` on `/usernames/{id}`)**: `updateDoc(doc(db, 'usernames', 'alice'), { email: 'hacker@evil.com' })`
8. **ID Poisoning on Trip Create (1.5KB junk document ID or invalid characters)**: `setDoc(doc(db, 'users', uid, 'trips', 'bad/../../id'), validTrip)`
9. **Orphaned Trip Write (Parent `/users/{userId}` does not exist)**: `setDoc(doc(db, 'users', uid, 'trips', 'trip1'), validTrip)` when `/users/{uid}` is absent
10. **Shadow Update on Trip (Injecting unauthorized field)**: `updateDoc(tripRef, { smartBufferMin: 15, adminApproved: true })`
11. **Value Poisoning on Trip (`smartBufferMin` as string or huge `notes` > 500 chars)**: `updateDoc(tripRef, { smartBufferMin: "hacked", updatedAt: serverTimestamp() })`
12. **Unbounded Attendees Array (>20 items) on Trip Create**: `{ ...validTrip, attendees: Array(25).fill({...}) }`
