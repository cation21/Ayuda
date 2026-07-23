# Core System Logic — Donation Platform

**Companion to:** project-spec.md
**Purpose:** Define the data model and core business logic before implementation begins.

---

## 1. Data Model (Entities & Relationships)

### 1.1 User
```
User
- id
- username, email, phone
- password_hash
- account_type: enum [INDIVIDUAL, NGO, COMPANY, DONOR_ONLY]
- display_name
- handle (pseudonymous-safe, does not have to be real name)
- bio
- avatar_url
- verification_tier: enum [UNVERIFIED, COMMUNITY_VERIFIED, DOCUMENT_VERIFIED, ANON_VERIFIED]
- is_anonymous_mode: bool          # hides real identity even from most staff views
- region (broad only — country/state, never precise geolocation)
- created_at
- flagged_count (fraud signal, staff-only field)
- payout_account_ref (tokenized reference to payment provider account, not raw bank details)
- impact_stats (denormalized, recalculated — see Section 1.1a)
```

### 1.1a ImpactStats (denormalized aggregate — powers the "Recent Impact" card seen in UI reference)
```
ImpactStats
- subject_id (FK -> User or Organization)
- subject_type: enum [USER, ORGANIZATION]
- total_raised (derived from Donation sum, same re-derive-don't-trust rule as Post.amount_raised)
- total_donated (derived from Donation sum where this subject is donor)
- families_assisted / people_supported / meals_provided / etc.
  # category-specific counters, populated from ProofOfWork submissions and/or
  # Post.category tallies at close — exact counter set is a product decision,
  # not an engineering one; keep this table schema-flexible (a counters map
  # rather than fixed columns) so new impact categories don't require a migration
- last_recalculated_at
  # recalculate on a schedule or on-demand, never trust as a live source of
  # truth for anything payout-related — same discipline as amount_raised
```
This is a read-optimized cache, not a source of truth — always re-derivable from the Donation ledger and ProofOfWork records. Never write to it directly from a request path; recompute it as a background job or on-demand query.

### 1.2 Organization (extends User for NGO/Company account_type)
```
Organization
- user_id (FK -> User)
- legal_name
- registration_number            # NGO Darpan ID / company registration / 12A-80G etc.
- registry_source: enum [NGO_DARPAN, MCA, OTHER]
- registration_doc_url            # stored securely, staff-access only
- verification_status: enum [PENDING, VERIFIED, REJECTED]
- verified_by (staff user id)
- verified_at
```

### 1.3 VerificationRequest
```
VerificationRequest
- id
- subject_user_id (FK -> User)     # the individual or org being verified
- requested_tier: enum [COMMUNITY_VERIFIED, DOCUMENT_VERIFIED, ANON_VERIFIED]
- submitted_docs: [doc_url]        # KYC docs, registration docs, etc.
- vouching_partner_org_id (FK -> Organization, nullable)  # for community/anon verification
- status: enum [PENDING, APPROVED, REJECTED, MORE_INFO_NEEDED]
- reviewer_id (staff user, nullable)
- review_notes
- created_at, resolved_at
```

### 1.4 Post
```
Post
- id
- author_id (FK -> User)
- title
- description
- category: enum [MEDICAL, DISASTER, EDUCATION, CONFLICT_EMERGENCY, OTHER]
- requested_amount
- amount_raised (denormalized, recalculated from Donation sum — never trust this field alone, always re-derive from ledger for anything payout-related)
- currency
- status: enum [ACTIVE, FUNDED, PROOF_PENDING, PROOF_UPLOADED, CLOSED, FLAGGED, REMOVED]
- media: [media_url]
- is_anonymous_post: bool
- created_at
- funded_at (nullable — set when amount_raised >= requested_amount)
- payout_policy: enum [PHASED_DEFAULT, IMMEDIATE_APPROVED]
  # PHASED_DEFAULT: up to 50% released on funding, remainder after proof
  # verification (see Section 4a). IMMEDIATE_APPROVED: set only by a staff/
  # verifier override for situations that warrant it (e.g. established
  # DOCUMENT_VERIFIED org, acute emergency) — see Section 4a for the
  # override workflow
- payout_policy_set_by (FK -> User, nullable)   # who approved a non-default policy
- payout_policy_notes
```

### 1.5 Donation (the ledger — see Section 5 for integrity design)
```
Donation
- id
- post_id (FK -> Post)
- donor_id (FK -> User, nullable if anonymous donor)
- amount
- currency
- payment_provider: enum [RAZORPAY, STRIPE, UPI, CRYPTO]
- provider_transaction_ref        # external payment provider's transaction id
- is_donor_anonymous: bool         # donor chose not to show identity publicly
- is_interaction_payment: bool     # true if this was the min-payment-to-comment, not a real donation
- prev_hash                        # hash of the previous Donation record (chain integrity)
- record_hash                      # hash of this record's contents + prev_hash
- timestamp
- status: enum [PENDING, CONFIRMED, FAILED, REFUNDED]
```

### 1.6 ProofOfWork
```
ProofOfWork
- id
- post_id (FK -> Post)
- uploaded_by (FK -> User)
- media: [media_url]               # EXIF-stripped on upload, see Section 6
- description
- status: enum [PENDING_UPLOAD, UPLOADED, COMMUNITY_VERIFIED, FORMALLY_VERIFIED, FLAGGED_UNCLEAR, REJECTED]
- uploaded_at
- verification_method: enum [NONE, ML_MODEL, HUMAN_VOLUNTEER, STAFF]
  # distinct from the soft "community flag" signal below — this is the
  # formal check that actually gates the remainder payout release
- ml_confidence_score (nullable, 0-1)   # if verification_method = ML_MODEL
- verified_by (FK -> User, nullable)     # human volunteer or staff reviewer
- verified_at (nullable)
```

### 1.6a PayoutRelease (tracks each tranche paid out against a post)
```
PayoutRelease
- id
- post_id (FK -> Post)
- tranche: enum [INITIAL, REMAINDER, FULL_IMMEDIATE]
- amount
- trigger: enum [FUNDING_THRESHOLD, PROOF_VERIFIED, VERIFIER_OVERRIDE]
- triggered_by (FK -> User, nullable)   # staff/verifier who approved an override, null if automatic
- status: enum [PENDING, RELEASED, HELD, REVERSED]
- released_at (nullable)
- notes
```
Same append-only discipline as Donation — never edit a PayoutRelease record after creation; a correction (e.g. clawback) is a new record with status = REVERSED referencing the original, not a mutation.

### 1.7 Interaction (comments/reactions — gated by min payment)
```
Interaction
- id
- post_id (FK -> Post)
- user_id (FK -> User)
- type: enum [COMMENT, LIKE]
- content (nullable for LIKE)
- linked_donation_id (FK -> Donation)   # every interaction must reference the ₹1+ payment that unlocked it
- created_at
```

### 1.8 Report / ModerationFlag
```
ModerationFlag
- id
- target_type: enum [POST, USER, PROOF_OF_WORK]
- target_id
- reported_by (FK -> User)
- reason
- status: enum [OPEN, REVIEWING, ACTION_TAKEN, DISMISSED]
- staff_notes
- created_at, resolved_at
```

---

### 1.9 TrustPanel (shared derived view — not a stored entity)
The UI reference screens show the same "Trust & Transparency" panel (numeric trust score, itemized checklist, ledger link) on organization pages, individual profile pages, and implicitly on post headers. This should be **one backend endpoint and one frontend component**, not three separate implementations:

```
GET /api/trust-panel/:subjectType/:subjectId  ->
{
  subject_type: USER | ORGANIZATION,
  trust_score: number,          # derived, see below — not a stored field
  checklist: [
    { label: "Identity Verified" | "NGO Darpan Registered" | etc., passed: bool }
  ],
  registration_number,          # organizations only
  verified_at,
  last_verified_at,
  ledger_url                    # link to this subject's filtered public ledger view
}
```
- `checklist` items are derived from `verification_tier` + `Organization.verification_status` fields already in the model — don't duplicate this data into a separate table, compute the checklist shape from existing fields at request time (or cache it alongside `ImpactStats` if it becomes a performance concern).
- `trust_score` is a computed value (e.g. weighted combination of verification tier, flagged_count, ledger consistency, proof-of-work completion rate) — define the exact formula as a policy decision later; keep it isolated in one service function (`computeTrustScore()`) so the formula can change without touching every place the score is displayed.
- Building this as a single shared component now avoids three divergent implementations later when the checklist logic inevitably changes.



```
1. User signs up as INDIVIDUAL, NGO, or COMPANY.
2. Default state: UNVERIFIED.
   - Can browse, can donate, CANNOT post a request, CANNOT receive payouts.
3. User submits VerificationRequest with requested_tier + docs.

   Branch A — NGO / Company (-> DOCUMENT_VERIFIED):
     a. Registration number checked against registry (NGO Darpan / MCA) via
        KYC aggregator (Surepass/Digio/Decentro-style, per earlier discussion).
     b. Staff reviewer confirms doc authenticity + registry match.
     c. On approval: Organization.verification_status = VERIFIED,
        User.verification_tier = DOCUMENT_VERIFIED.

   Branch B — Individual, standard (-> COMMUNITY_VERIFIED):
     a. Individual requests vouching from a DOCUMENT_VERIFIED partner Organization.
     b. Partner org confirms identity/need out-of-band (their own due diligence).
     c. Staff reviews the vouching record, approves.
     d. On approval: User.verification_tier = COMMUNITY_VERIFIED.

   Branch C — At-risk individual (-> ANON_VERIFIED):
     a. Same as Branch B, but the vouching partner verifies identity PRIVATELY.
     b. Real identity is stored encrypted, staff-access-only, never surfaced
        in any public API response or admin view beyond the minimum reviewer set.
     c. Public-facing handle/profile remains pseudonymous permanently.
     d. On approval: User.verification_tier = ANON_VERIFIED,
        is_anonymous_mode = true (cannot be turned off by the user for this tier
        without a re-verification step, to prevent accidental de-anonymization).

4. Rejected requests: status = REJECTED, review_notes stored, user may resubmit
   with corrected docs after a cooldown (prevents rapid-fire spam resubmission).
```

**Key rule:** `verification_tier` gates what a user can *do* (post a request, set donation caps), never what a donor can *see* about them beyond what their tier's privacy rules allow.

---

## 3. Core Workflow: Creating a Money Request Post

```
1. Author must be verification_tier IN [COMMUNITY_VERIFIED, DOCUMENT_VERIFIED, ANON_VERIFIED].
2. Author fills: title, description, category, requested_amount, media.
3. If author.is_anonymous_mode -> Post.is_anonymous_post = true automatically,
   display name shown is the pseudonymous handle, not real identity.
4. Post enters status = ACTIVE and appears in feed.
5. Donation cap check: a per-tier maximum request amount applies
   (COMMUNITY_VERIFIED lower cap, DOCUMENT_VERIFIED higher, ANON_VERIFIED
   standard cap) — prevents a single unverified-ish account from soliciting
   unlimited amounts before more scrutiny kicks in.
6. Post is queued for a lightweight automated fraud check (duplicate image
   detection, duplicate description text against existing posts, velocity
   check on how many posts this account has created recently) before it's
   fully visible — flagged posts go to ModerationFlag with status OPEN and
   are held from full feed visibility until cleared.
```

---

## 4. Core Workflow: Donation & Interaction Payment

```
1. Donor selects an amount on a Post (either a real donation or the minimum
   ₹1 interaction payment).
2. Payment initiated via provider (Razorpay/Stripe/UPI primary, crypto optional).
3. On provider webhook confirming success:
   a. Create Donation record:
      - status = CONFIRMED
      - compute record_hash (see Section 5)
      - link provider_transaction_ref
   b. Recalculate Post.amount_raised by summing CONFIRMED donations for
      that post (never increment in place — always re-derive from source
      of truth to avoid drift/double-counting bugs).
   c. If amount_raised >= requested_amount and Post.status == ACTIVE:
      - Post.status = FUNDED
      - Post.funded_at = now()
      - Trigger notification to author: "proof of work window now open"
4. If this payment was the min-payment gating a comment/like:
   - Donation.is_interaction_payment = true
   - Interaction record created, linked_donation_id = this donation
   - Interaction only becomes visible once Donation.status == CONFIRMED
     (prevents comment appearing before payment actually clears)
5. Failed/pending payments never create a Donation with status CONFIRMED —
   no ledger entry, no public visibility, no interaction unlock.
6. Refunds: create a new Donation record with status = REFUNDED referencing
   the original (never delete or mutate the original record — the ledger
   is append-only, corrections are new entries, not edits).
```

---

## 4a. Core Workflow: Phased Payout Release

Resolves the "payout timing" open question from earlier drafts — release is phased by default, with an override path for cases that warrant faster access to funds.

```
Default path — Post.payout_policy = PHASED_DEFAULT:

1. Funds accumulate as Donations confirm (per Section 4). No payout yet.
2. When amount_raised crosses 50% of requested_amount (configurable
   threshold — exact % is a policy decision, 50% is the stated default):
   a. Create PayoutRelease: tranche = INITIAL, amount = up to 50% of
      amount_raised, trigger = FUNDING_THRESHOLD, status = PENDING.
   b. On successful transfer to recipient's payout_account_ref:
      status = RELEASED, released_at = now().
3. Remainder is held until ProofOfWork reaches a FORMALLY_VERIFIED state
   (not just COMMUNITY_VERIFIED — the soft donor flag from Section 6 is a
   trust/UX signal, not sufficient on its own to release money):
   a. ProofOfWork.verification_method = ML_MODEL:
      - Automated check (image authenticity, duplicate-detection,
        content-matches-category heuristics) produces ml_confidence_score.
      - Above a configured confidence threshold -> auto-progress to
        FORMALLY_VERIFIED. Below threshold -> routes to HUMAN_VOLUNTEER
        review instead of auto-rejecting (ML is a filter/prioritizer,
        not a sole gatekeeper on money release).
   b. ProofOfWork.verification_method = HUMAN_VOLUNTEER:
      - Routed to a volunteer reviewer queue (separate, lighter-weight
        queue from full staff moderation — volunteers confirm proof
        looks legitimate, they don't have moderation powers like
        freeze/remove).
      - Reviewer marks verified_by, verified_at; status = FORMALLY_VERIFIED
        or REJECTED (with notes) if it doesn't hold up.
   c. On FORMALLY_VERIFIED:
      - Create PayoutRelease: tranche = REMAINDER, amount = remaining
        balance, trigger = PROOF_VERIFIED, status = PENDING -> RELEASED.
   d. On REJECTED:
      - Post.status = FLAGGED, ModerationFlag created for staff review.
        Remainder payout stays HELD until staff resolves.

Override path — Post.payout_policy = IMMEDIATE_APPROVED:

1. A staff member or an authorized verifier (e.g. senior reviewer role,
   not any COMMUNITY_VERIFIED user) flags a specific post as eligible for
   full immediate release without waiting for proof-of-work — for
   situations like an established DOCUMENT_VERIFIED org with a strong
   track record, or an acute emergency where waiting for proof genuinely
   costs safety/time.
2. Setting this requires payout_policy_set_by + payout_policy_notes
   (reason recorded — this is an exception path and needs an audit trail,
   same principle as staff moderation actions in Section 7).
3. On funding threshold reached: create PayoutRelease with
   tranche = FULL_IMMEDIATE, trigger = VERIFIER_OVERRIDE,
   triggered_by = the approving verifier.
4. Proof-of-work upload is still requested/expected afterward for
   transparency/ledger completeness, but it no longer gates any payout —
   Post.status still progresses through PROOF_PENDING/PROOF_UPLOADED for
   display purposes, just decoupled from the release trigger.

Note on "rest released as per need submission": the remainder amount
released is whatever's left against the post's originally stated
requested_amount and category — i.e. the release always reconciles
against what was actually requested/needed in the original Post, not an
arbitrary amount. Post edits to requested_amount after funding has begun
should be restricted or require re-verification, to prevent goal-amount
drift from being used to justify releasing more than was originally
substantiated.
```



This is what gives you "publicly verifiable without trusting the platform" without needing a blockchain. In MongoDB, the "create Donation + recalculate Post.amount_raised (+ create Interaction, if applicable)" sequence below must run inside an explicit multi-document transaction (`session.withTransaction()`, requires MongoDB running as a replica set — do this locally too, not just in production) so these writes succeed or fail together.

```
On creating Donation record N:
  1. Fetch record_hash of Donation N-1 (the previous confirmed donation,
     globally across the whole platform — a single global chain, not
     per-post, so the whole ledger is one verifiable sequence).
  2. Compute:
       record_hash(N) = SHA256(
           donation_id + post_id + donor_id_or_null + amount + currency +
           provider_transaction_ref + timestamp + prev_hash
       )
  3. Store record_hash(N) and prev_hash = record_hash(N-1) on the record.

Verification (anyone can run this, it's the point):
  - Walk the chain from the first donation to the latest.
  - Recompute each record_hash from its stored fields and compare to the
    stored value, and confirm prev_hash matches the prior record's hash.
  - Any tampering (edited amount, altered timestamp, deleted record) breaks
    the chain from that point forward — mismatch is immediately detectable.

Public exposure:
  - Expose a read-only API endpoint returning the full ledger (or paginated
    per-post) so it can be independently verified by anyone, not just logged
    in users.
  - Optionally, periodically publish the latest record_hash to an external
    public timestamping service (or anchor it on a public blockchain) so
    even the platform operator can't quietly rewrite history — this is the
    "anchor" mentioned in the spec doc, and it's the one place a real
    blockchain reference adds genuine value without the wallet/gas overhead
    of putting every donation on-chain.
```

---

## 6. Core Logic: Proof of Work Unlock

```
1. Post.status becomes FUNDED (per Section 4).
2. Post.status transitions to PROOF_PENDING; a ProofOfWork record is
   created with status = PENDING_UPLOAD, visible in the UI as the
   dashed-border "awaiting proof" box.
3. Author uploads media/description:
   a. Every uploaded file passes through EXIF/GPS metadata stripping
      before storage (non-negotiable, runs server-side on upload,
      never trust client-side stripping).
   b. ProofOfWork.status = UPLOADED, Post.status = PROOF_UPLOADED.
4. Community verification (lightweight, social-trust signal — NOT what
   gates the remainder payout release, see Section 4a for that):
   - Any donor to that specific post can mark proof as "looks legitimate"
     or "flag as unclear" — this is a soft signal, not an automatic action.
   - Crosses a flag threshold -> ProofOfWork.status = FLAGGED_UNCLEAR,
     creates a ModerationFlag for staff review.
5. Formal verification (this is what actually unlocks the remainder
   payout — see Section 4a for the full release logic):
   - ML_MODEL and/or HUMAN_VOLUNTEER review, independent of the community
     soft-flag step above (both can run in parallel — a post can be
     community-flagged as unclear while formal verification is still
     pending, or vice versa; they're separate signals feeding separate
     outcomes).
   - Staff can independently mark ProofOfWork.status = FORMALLY_VERIFIED
     after manual review for high-value or flagged posts, overriding
     ML/volunteer outcomes when needed.
```

---

## 7. Core Logic: Moderation & Fraud Signals

```
Automated flags feeding into ModerationFlag (all advisory, none auto-remove
content — a human always makes the takedown call):
  - Duplicate image hash across multiple posts/accounts
  - Duplicate/near-duplicate description text across accounts
  - Unusual donation velocity (many small donations from newly created
    accounts in a short window — possible wash-trading/fake social proof)
  - Post creation velocity per account
  - Proof-of-work flagged by multiple donors past a threshold
  - User-submitted reports

Staff review queue (this needs to be custom-built in MERN — there's no
free Django-Admin-style equivalent, so budget real design/dev time for
this rather than treating it as an afterthought):
  - A role-gated internal React dashboard, separate route/auth guard from
    the main app, hitting dedicated Express admin routes
  - Filter by flag type, severity, account verification tier
  - Actions: dismiss, request more info from author, freeze post (stops new
    donations, existing ones stand), remove post, suspend account
  - All actions logged with staff_id + timestamp + reason (audit trail —
    staff accountability matters as much as user accountability here)
```

---

## 8. Open Logic Questions (resolve before implementation)

- **Payout release — resolved at the policy level, some parameters still open:** default is phased release (up to 50% on funding threshold, remainder after formal proof verification via ML model or human volunteer), with a staff/verifier override path for full immediate release in warranted cases (see Section 4a). Still to decide:
  - Exact initial-release percentage and funding threshold (50% used as the stated default — confirm as final or make configurable per category, e.g. medical emergencies might warrant a different split than education campaigns)
  - Who exactly is authorized to approve an `IMMEDIATE_APPROVED` override — a defined "senior verifier" role distinct from regular staff, or open to any staff reviewer? This needs to be a deliberately scoped permission, not implicit.
  - ML confidence threshold for auto-progressing ProofOfWork to FORMALLY_VERIFIED vs. routing to human volunteer review
  - Volunteer reviewer vetting/onboarding — since HUMAN_VOLUNTEER verification directly gates money release, volunteers likely need their own lightweight trust tier rather than being fully open-signup
- **Partial refund logic:** if a post is later found fraudulent after partial payout, what's the recovery mechanism? Needs a legal answer as much as a technical one.
- **Anonymous donor + ledger tension:** an anonymous donor still needs a KYC'd payment method underneath (regulatory requirement) — "anonymous" only means *publicly* anonymous, staff/compliance must always be able to trace a transaction if legally required. Make sure this distinction is explicit in your privacy policy, not just your code.
- **Per-tier donation caps:** exact numbers need setting — placeholder logic above, actual values are a policy decision, not an engineering one.
