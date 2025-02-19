;; Research Proposal Contract

;; Define data structures
(define-map research-proposals
  { proposal-id: uint }
  {
    researcher: principal,
    title: (string-utf8 256),
    description: (string-utf8 1024),
    required-sample-size: uint,
    status: (string-ascii 20),
    approved-count: uint
  }
)

(define-map dna-approvals
  { proposal-id: uint, dna-id: uint }
  { approved: bool }
)

(define-data-var next-proposal-id uint u1)

;; Constants
(define-constant STATUS-PENDING "PENDING")
(define-constant STATUS-APPROVED "APPROVED")
(define-constant STATUS-REJECTED "REJECTED")

;; Error codes
(define-constant err-not-found (err u101))
(define-constant err-already-approved (err u102))
(define-constant err-not-owner (err u103))

;; Functions
(define-public (submit-proposal (title (string-utf8 256)) (description (string-utf8 1024)) (required-sample-size uint))
  (let
    ((proposal-id (var-get next-proposal-id)))
    (map-set research-proposals
      { proposal-id: proposal-id }
      {
        researcher: tx-sender,
        title: title,
        description: description,
        required-sample-size: required-sample-size,
        status: STATUS-PENDING,
        approved-count: u0
      }
    )
    (var-set next-proposal-id (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (approve-proposal (proposal-id uint) (dna-id uint))
  (let
    ((proposal (unwrap! (map-get? research-proposals { proposal-id: proposal-id }) err-not-found)))
    (asserts! (is-none (map-get? dna-approvals { proposal-id: proposal-id, dna-id: dna-id })) err-already-approved)
    (map-set dna-approvals { proposal-id: proposal-id, dna-id: dna-id } { approved: true })
    (let
      ((new-approved-count (+ (get approved-count proposal) u1))
       (new-status (if (>= new-approved-count (get required-sample-size proposal))
                       STATUS-APPROVED
                       (get status proposal))))
      (ok (map-set research-proposals
        { proposal-id: proposal-id }
        (merge proposal
          {
            approved-count: new-approved-count,
            status: new-status
          }
        )
      ))
    )
  )
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? research-proposals { proposal-id: proposal-id })
)

(define-read-only (check-dna-approval (proposal-id uint) (dna-id uint))
  (default-to
    false
    (get approved (map-get? dna-approvals { proposal-id: proposal-id, dna-id: dna-id }))
  )
)

