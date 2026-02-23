import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { setDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";

let testEnv: RulesTestEnvironment;
const PROJECT_ID = "firestore-rules-test";
const USER_A_UID = "user-a";
const USER_B_UID = "user-b";

beforeAll(async () => {
  const rules = readFileSync(
    resolve(__dirname, "../firestore.rules"),
    "utf8"
  );
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules, host: "127.0.0.1", port: 8080 },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// --- Helper to seed a user doc via admin ---
async function seedUser(uid: string, data: Record<string, unknown> = {}) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, `users/${uid}`), {
      name: "Test User",
      email: "test@test.com",
      level: null,
      levelScore: null,
      diagnosticCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...data,
    });
  });
}

// =================================================================
// 1. User Profile CRUD
// =================================================================
describe("User Profile", () => {
  it("allows user to create own profile with required fields", async () => {
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(db, `users/${USER_A_UID}`), {
        name: "Matheus",
        email: "matheus@test.com",
        createdAt: serverTimestamp(),
      })
    );
  });

  it("denies creating profile for another user", async () => {
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      setDoc(doc(db, `users/${USER_B_UID}`), {
        name: "Hacker",
        email: "hack@test.com",
        createdAt: serverTimestamp(),
      })
    );
  });

  it("denies creating profile without required fields", async () => {
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      setDoc(doc(db, `users/${USER_A_UID}`), {
        name: "Matheus",
        // missing email and createdAt
      })
    );
  });

  it("allows user to read own profile", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(getDoc(doc(db, `users/${USER_A_UID}`)));
  });

  it("denies reading another user's profile", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_B_UID).firestore();
    await assertFails(getDoc(doc(db, `users/${USER_A_UID}`)));
  });

  it("denies unauthenticated access", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, `users/${USER_A_UID}`)));
  });

  it("allows updating own safe fields (name, scheduleWeekly)", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      updateDoc(doc(db, `users/${USER_A_UID}`), {
        name: "Matheus Updated",
        scheduleWeekly: { mon: ["18:00"] },
        updatedAt: serverTimestamp(),
      })
    );
  });

  it("denies deleting user profile", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(deleteDoc(doc(db, `users/${USER_A_UID}`)));
  });
});

// =================================================================
// 2. Critical Fields Write-Protection
// =================================================================
describe("Critical Fields Protection", () => {
  it("denies client writing 'level' on user doc", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}`), {
        level: "B1",
      })
    );
  });

  it("denies client writing 'levelScore' on user doc", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}`), {
        levelScore: 85,
      })
    );
  });

  it("denies client writing 'diagnosticCompleted' on user doc", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}`), {
        diagnosticCompleted: true,
      })
    );
  });

  it("denies client changing 'email' on user doc", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}`), {
        email: "hacked@evil.com",
      })
    );
  });

  it("denies client writing 'adapterState' on user doc", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}`), {
        adapterState: { grammar: "tooEasy" },
      })
    );
  });
});

// =================================================================
// 3. Diagnostics
// =================================================================
describe("Diagnostics", () => {
  it("allows creating a diagnostic with required fields", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      addDoc(collection(db, `users/${USER_A_UID}/diagnostics`), {
        type: "initial",
        status: "in_progress",
        startedAt: serverTimestamp(),
      })
    );
  });

  it("denies creating diagnostic with overallScore set", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      addDoc(collection(db, `users/${USER_A_UID}/diagnostics`), {
        type: "initial",
        status: "in_progress",
        startedAt: serverTimestamp(),
        overallScore: 90,
      })
    );
  });

  it("denies client updating overallScore on diagnostic", async () => {
    await seedUser(USER_A_UID);
    let diagId: string;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const ref = doc(db, `users/${USER_A_UID}/diagnostics/diag-1`);
      await setDoc(ref, {
        type: "initial",
        status: "in_progress",
        overallScore: null,
        startedAt: serverTimestamp(),
      });
      diagId = "diag-1";
    });
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}/diagnostics/${diagId!}`), {
        overallScore: 95,
      })
    );
  });
});

// =================================================================
// 4. Homework (Cloud Functions only create)
// =================================================================
describe("Homework", () => {
  it("denies client creating homework", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      addDoc(collection(db, `users/${USER_A_UID}/homework`), {
        sourceSessionId: "sess-1",
        sourceType: "grammar",
        contentRef: "ref-1",
        status: "pending",
        deadline: serverTimestamp(),
        createdAt: serverTimestamp(),
      })
    );
  });

  it("allows client reading own homework", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/homework/hw-1`), {
        sourceSessionId: "sess-1",
        sourceType: "grammar",
        contentRef: "ref-1",
        status: "pending",
        deadline: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      getDoc(doc(db, `users/${USER_A_UID}/homework/hw-1`))
    );
  });

  it("allows client updating homework status (completing)", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/homework/hw-1`), {
        sourceSessionId: "sess-1",
        sourceType: "grammar",
        contentRef: "ref-1",
        status: "pending",
        score: null,
        deadline: serverTimestamp(),
        spacedRepetitionStep: 0,
        createdAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      updateDoc(doc(db, `users/${USER_A_UID}/homework/hw-1`), {
        status: "completed",
        score: 85,
        completedAt: serverTimestamp(),
      })
    );
  });
});

// =================================================================
// 5. Adaptations (read-only)
// =================================================================
describe("Adaptations", () => {
  it("allows reading own adaptations", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/adaptations/adapt-1`), {
        triggerSessionId: "sess-1",
        area: "grammar",
        previousZone: "ideal",
        newZone: "tooEasy",
        recentAccuracy: 95,
        adjustment: "increased",
        reason: "High accuracy in last 5 sessions",
        createdAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      getDoc(doc(db, `users/${USER_A_UID}/adaptations/adapt-1`))
    );
  });

  it("denies client writing adaptations", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      addDoc(collection(db, `users/${USER_A_UID}/adaptations`), {
        triggerSessionId: "sess-1",
        area: "grammar",
        previousZone: "ideal",
        newZone: "tooHard",
        recentAccuracy: 40,
        adjustment: "decreased",
        reason: "Manipulated",
        createdAt: serverTimestamp(),
      })
    );
  });
});

// =================================================================
// 6. Reports (immutable)
// =================================================================
describe("Reports", () => {
  it("allows creating a report with valid category", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertSucceeds(
      addDoc(collection(db, `users/${USER_A_UID}/reports`), {
        category: "grammar_error",
        screen: "chat",
        contentSnapshot: "La casa es rojo",
        createdAt: serverTimestamp(),
      })
    );
  });

  it("denies creating report with invalid category", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      addDoc(collection(db, `users/${USER_A_UID}/reports`), {
        category: "invalid_category",
        screen: "chat",
        contentSnapshot: "test",
        createdAt: serverTimestamp(),
      })
    );
  });

  it("denies updating a report (immutable)", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/reports/rep-1`), {
        category: "grammar_error",
        screen: "chat",
        contentSnapshot: "error",
        createdAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      updateDoc(doc(db, `users/${USER_A_UID}/reports/rep-1`), {
        reviewed: true,
      })
    );
  });

  it("denies deleting a report", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/reports/rep-1`), {
        category: "grammar_error",
        screen: "chat",
        contentSnapshot: "error",
        createdAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_A_UID).firestore();
    await assertFails(
      deleteDoc(doc(db, `users/${USER_A_UID}/reports/rep-1`))
    );
  });
});

// =================================================================
// 7. Cross-user isolation
// =================================================================
describe("Cross-user Isolation", () => {
  it("denies user B reading user A diagnostics", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/diagnostics/diag-1`), {
        type: "initial",
        status: "completed",
        overallScore: 75,
        startedAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_B_UID).firestore();
    await assertFails(
      getDoc(doc(db, `users/${USER_A_UID}/diagnostics/diag-1`))
    );
  });

  it("denies user B writing to user A sessions", async () => {
    await seedUser(USER_A_UID);
    const db = testEnv.authenticatedContext(USER_B_UID).firestore();
    await assertFails(
      addDoc(collection(db, `users/${USER_A_UID}/sessions`), {
        type: "chat",
        status: "active",
        startedAt: serverTimestamp(),
      })
    );
  });

  it("denies user B reading user A homework", async () => {
    await seedUser(USER_A_UID);
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `users/${USER_A_UID}/homework/hw-1`), {
        sourceSessionId: "s1",
        sourceType: "grammar",
        contentRef: "ref",
        status: "pending",
        deadline: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    });
    const db = testEnv.authenticatedContext(USER_B_UID).firestore();
    await assertFails(
      getDoc(doc(db, `users/${USER_A_UID}/homework/hw-1`))
    );
  });
});
