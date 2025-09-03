;; sBTC Marketplace Payment Gateway Contract
;; This contract handles secure payments between buyers and sellers

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-PAYMENT-NOT-FOUND (err u101))
(define-constant ERR-PAYMENT-EXPIRED (err u102))
(define-constant ERR-PAYMENT-ALREADY-COMPLETED (err u103))
(define-constant ERR-INSUFFICIENT-FUNDS (err u104))
(define-constant ERR-INVALID-AMOUNT (err u105))

;; Data Variables
(define-data-var payment-counter uint u0)
(define-data-var fee-percentage uint u290) ;; 2.9% as basis points
(define-data-var platform-wallet principal CONTRACT-OWNER)

;; Payment Status
(define-constant PAYMENT-PENDING u0)
(define-constant PAYMENT-COMPLETED u1)
(define-constant PAYMENT-REFUNDED u2)
(define-constant PAYMENT-EXPIRED u3)

;; Payment Data Structure
(define-map payments
  uint
  {
    buyer: principal,
    seller: principal,
    amount: uint,
    fee-amount: uint,
    net-amount: uint,
    product-id: (string-ascii 50),
    status: uint,
    created-at: uint,
    expires-at: uint,
    completed-at: (optional uint),
    tx-id: (optional (buff 32))
  }
)

;; Escrow Data Structure
(define-map escrow
  uint
  {
    amount: uint,
    released: bool
  }
)

;; Product Registry
(define-map products
  (string-ascii 50)
  {
    seller: principal,
    price: uint,
    active: bool
  }
)

;; User Balances (for escrow)
(define-map user-balances
  principal
  uint
)

;; Payment creation function
(define-public (create-payment
    (seller principal)
    (amount uint)
    (product-id (string-ascii 50))
  )
  (let
    (
      (payment-id (+ (var-get payment-counter) u1))
      (fee-amount (calculate-fee amount))
      (net-amount (- amount fee-amount))
      (expires-at (+ block-height u144)) ;; ~24 hours (assuming 10min blocks)
    )
    
    ;; Validate amount
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Create payment record
    (map-set payments payment-id
      {
        buyer: tx-sender,
        seller: seller,
        amount: amount,
        fee-amount: fee-amount,
        net-amount: net-amount,
        product-id: product-id,
        status: PAYMENT-PENDING,
        created-at: block-height,
        expires-at: expires-at,
        completed-at: none,
        tx-id: none
      }
    )
    
    ;; Initialize escrow
    (map-set escrow payment-id
      {
        amount: amount,
        released: false
      }
    )
    
    ;; Update payment counter
    (var-set payment-counter payment-id)
    
    (ok payment-id)
  )
)

;; Complete payment function
(define-public (complete-payment (payment-id uint) (tx-id (buff 32)))
  (let
    (
      (payment-data (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND))
      (escrow-data (unwrap! (map-get? escrow payment-id) ERR-PAYMENT-NOT-FOUND))
    )
    
    ;; Only buyer can complete payment
    (asserts! (is-eq tx-sender (get buyer payment-data)) ERR-UNAUTHORIZED)
    
    ;; Check payment hasn't expired
    (asserts! (< block-height (get expires-at payment-data)) ERR-PAYMENT-EXPIRED)
    
    ;; Check payment isn't already completed
    (asserts! (is-eq (get status payment-data) PAYMENT-PENDING) ERR-PAYMENT-ALREADY-COMPLETED)
    
    ;; Update payment status
    (map-set payments payment-id
      (merge payment-data {
        status: PAYMENT-COMPLETED,
        completed-at: (some block-height),
        tx-id: (some tx-id)
      })
    )
    
    ;; Release funds from escrow to seller
    (try! (release-escrow payment-id))
    
    (ok true)
  )
)

;; Refund payment function
(define-public (refund-payment (payment-id uint))
  (let
    (
      (payment-data (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND))
      (escrow-data (unwrap! (map-get? escrow payment-id) ERR-PAYMENT-NOT-FOUND))
    )
    
    ;; Only seller or contract owner can initiate refund
    (asserts! (or (is-eq tx-sender (get seller payment-data))
                  (is-eq tx-sender CONTRACT-OWNER)) ERR-UNAUTHORIZED)
    
    ;; Check payment is in valid state for refund
    (asserts! (is-eq (get status payment-data) PAYMENT-PENDING) ERR-PAYMENT-ALREADY-COMPLETED)
    
    ;; Update payment status
    (map-set payments payment-id
      (merge payment-data {
        status: PAYMENT-REFUNDED,
        completed-at: (some block-height)
      })
    )
    
    ;; Release funds back to buyer
    (try! (refund-escrow payment-id))
    
    (ok true)
  )
)

;; Register product function
(define-public (register-product 
    (product-id (string-ascii 50))
    (price uint)
  )
  (begin
    (map-set products product-id
      {
        seller: tx-sender,
        price: price,
        active: true
      }
    )
    (ok true)
  )
)

;; Deactivate product function
(define-public (deactivate-product (product-id (string-ascii 50)))
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PAYMENT-NOT-FOUND))
    )
    
    ;; Only seller can deactivate
    (asserts! (is-eq tx-sender (get seller product-data)) ERR-UNAUTHORIZED)
    
    (map-set products product-id
      (merge product-data { active: false })
    )
    (ok true)
  )
)

;; Internal function to calculate fees
(define-private (calculate-fee (amount uint))
  (/ (* amount (var-get fee-percentage)) u10000)
)

;; Internal function to release escrow to seller
(define-private (release-escrow (payment-id uint))
  (let
    (
      (payment-data (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND))
      (escrow-data (unwrap! (map-get? escrow payment-id) ERR-PAYMENT-NOT-FOUND))
    )
    
    ;; Mark escrow as released
    (map-set escrow payment-id
      (merge escrow-data { released: true })
    )
    
    ;; Update seller balance
    (map-set user-balances (get seller payment-data)
      (+ (default-to u0 (map-get? user-balances (get seller payment-data)))
         (get net-amount payment-data))
    )
    
    ;; Update platform balance with fees
    (map-set user-balances (var-get platform-wallet)
      (+ (default-to u0 (map-get? user-balances (var-get platform-wallet)))
         (get fee-amount payment-data))
    )
    
    (ok true)
  )
)

;; Internal function to refund escrow to buyer
(define-private (refund-escrow (payment-id uint))
  (let
    (
      (payment-data (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND))
      (escrow-data (unwrap! (map-get? escrow payment-id) ERR-PAYMENT-NOT-FOUND))
    )
    
    ;; Mark escrow as released
    (map-set escrow payment-id
      (merge escrow-data { released: true })
    )
    
    ;; Update buyer balance
    (map-set user-balances (get buyer payment-data)
      (+ (default-to u0 (map-get? user-balances (get buyer payment-data)))
         (get amount payment-data))
    )
    
    (ok true)
  )
)

;; Read-only functions

;; Get payment details
(define-read-only (get-payment (payment-id uint))
  (map-get? payments payment-id)
)

;; Get product details
(define-read-only (get-product (product-id (string-ascii 50)))
  (map-get? products product-id)
)

;; Get user balance
(define-read-only (get-user-balance (user principal))
  (default-to u0 (map-get? user-balances user))
)

;; Get escrow details
(define-read-only (get-escrow (payment-id uint))
  (map-get? escrow payment-id)
)

;; Get current payment counter
(define-read-only (get-payment-counter)
  (var-get payment-counter)
)

;; Admin functions

;; Update fee percentage (only owner)
(define-public (set-fee-percentage (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= new-fee u1000) ERR-INVALID-AMOUNT) ;; Max 10%
    (var-set fee-percentage new-fee)
    (ok true)
  )
)

;; Update platform wallet (only owner)
(define-public (set-platform-wallet (new-wallet principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set platform-wallet new-wallet)
    (ok true)
  )
)

;; Cleanup expired payments (only owner)
(define-public (cleanup-expired-payment (payment-id uint))
  (let
    (
      (payment-data (unwrap! (map-get? payments payment-id) ERR-PAYMENT-NOT-FOUND))
    )
    
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (> block-height (get expires-at payment-data)) ERR-PAYMENT-EXPIRED)
    (asserts! (is-eq (get status payment-data) PAYMENT-PENDING) ERR-PAYMENT-ALREADY-COMPLETED)
    
    ;; Mark as expired and refund
    (map-set payments payment-id
      (merge payment-data {
        status: PAYMENT-EXPIRED,
        completed-at: (some block-height)
      })
    )
    
    (try! (refund-escrow payment-id))
    (ok true)
  )
)