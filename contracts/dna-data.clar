;; DNA Data Contract

;; Define data structures
(define-map dna-records
  { dna-id: uint }
  {
    owner: principal,
    encrypted-data: (string-utf8 1024),
    metadata: (string-utf8 256),
    last-updated: uint
  }
)

(define-data-var next-dna-id uint u1)

;; Error codes
(define-constant err-not-owner (err u100))
(define-constant err-not-found (err u101))

;; Functions
(define-public (submit-dna-data (encrypted-data (string-utf8 1024)) (metadata (string-utf8 256)))
  (let
    ((dna-id (var-get next-dna-id)))
    (map-set dna-records
      { dna-id: dna-id }
      {
        owner: tx-sender,
        encrypted-data: encrypted-data,
        metadata: metadata,
        last-updated: block-height
      }
    )
    (var-set next-dna-id (+ dna-id u1))
    (ok dna-id)
  )
)

(define-public (update-dna-data (dna-id uint) (encrypted-data (string-utf8 1024)) (metadata (string-utf8 256)))
  (match (map-get? dna-records { dna-id: dna-id })
    record (begin
      (asserts! (is-eq (get owner record) tx-sender) err-not-owner)
      (ok (map-set dna-records
        { dna-id: dna-id }
        {
          owner: (get owner record),
          encrypted-data: encrypted-data,
          metadata: metadata,
          last-updated: block-height
        }
      ))
    )
    err-not-found
  )
)

(define-read-only (get-dna-metadata (dna-id uint))
  (match (map-get? dna-records { dna-id: dna-id })
    record (ok (get metadata record))
    err-not-found
  )
)

(define-read-only (get-dna-owner (dna-id uint))
  (match (map-get? dna-records { dna-id: dna-id })
    record (ok (get owner record))
    err-not-found
  )
)

