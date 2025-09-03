;; sBTC Marketplace Digital Products Contract
;; This contract manages digital product listings and access control

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-PRODUCT-NOT-FOUND (err u201))
(define-constant ERR-PRODUCT-INACTIVE (err u202))
(define-constant ERR-ACCESS-DENIED (err u203))
(define-constant ERR-INVALID-PRICE (err u204))
(define-constant ERR-ALREADY-PURCHASED (err u205))

;; Data Variables
(define-data-var product-counter uint u0)

;; Product Status
(define-constant PRODUCT-DRAFT u0)
(define-constant PRODUCT-PUBLISHED u1)
(define-constant PRODUCT-ARCHIVED u2)
(define-constant PRODUCT-DELETED u3)

;; Product Data Structure
(define-map products
  (string-ascii 50) ;; product-id
  {
    seller: principal,
    title: (string-ascii 100),
    description: (string-ascii 500),
    price: uint,
    category: (string-ascii 50),
    file-hash: (buff 32),
    preview-hash: (optional (buff 32)),
    status: uint,
    featured: bool,
    created-at: uint,
    updated-at: uint,
    download-count: uint,
    rating: uint, ;; Average rating * 100 (e.g., 450 = 4.5 stars)
    review-count: uint
  }
)

;; Product Access Control
(define-map product-access
  {product-id: (string-ascii 50), buyer: principal}
  {
    purchased-at: uint,
    download-count: uint,
    max-downloads: uint,
    expires-at: (optional uint)
  }
)

;; Product Reviews
(define-map product-reviews
  {product-id: (string-ascii 50), reviewer: principal}
  {
    rating: uint, ;; 1-5 stars
    comment: (string-ascii 500),
    created-at: uint,
    verified-purchase: bool
  }
)

;; Seller Stats
(define-map seller-stats
  principal
  {
    total-products: uint,
    total-sales: uint,
    total-revenue: uint,
    avg-rating: uint,
    joined-at: uint
  }
)

;; Category Data
(define-map categories
  (string-ascii 50)
  {
    name: (string-ascii 50),
    description: (string-ascii 200),
    product-count: uint,
    active: bool
  }
)

;; Product Creation Function
(define-public (create-product
    (product-id (string-ascii 50))
    (title (string-ascii 100))
    (description (string-ascii 500))
    (price uint)
    (category (string-ascii 50))
    (file-hash (buff 32))
    (preview-hash (optional (buff 32)))
  )
  (let
    (
      (current-count (var-get product-counter))
    )
    
    ;; Validate price
    (asserts! (> price u0) ERR-INVALID-PRICE)
    
    ;; Create product
    (map-set products product-id
      {
        seller: tx-sender,
        title: title,
        description: description,
        price: price,
        category: category,
        file-hash: file-hash,
        preview-hash: preview-hash,
        status: PRODUCT-DRAFT,
        featured: false,
        created-at: block-height,
        updated-at: block-height,
        download-count: u0,
        rating: u0,
        review-count: u0
      }
    )
    
    ;; Update seller stats
    (update-seller-stats tx-sender u1 u0 u0)
    
    ;; Update category count
    (update-category-count category u1)
    
    ;; Update product counter
    (var-set product-counter (+ current-count u1))
    
    (ok product-id)
  )
)

;; Product Update Function
(define-public (update-product
    (product-id (string-ascii 50))
    (title (string-ascii 100))
    (description (string-ascii 500))
    (price uint)
    (category (string-ascii 50))
  )
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PRODUCT-NOT-FOUND))
    )
    
    ;; Only seller can update
    (asserts! (is-eq tx-sender (get seller product-data)) ERR-UNAUTHORIZED)
    
    ;; Validate price
    (asserts! (> price u0) ERR-INVALID-PRICE)
    
    ;; Update product
    (map-set products product-id
      (merge product-data {
        title: title,
        description: description,
        price: price,
        category: category,
        updated-at: block-height
      })
    )
    
    (ok true)
  )
)

;; Publish Product Function
(define-public (publish-product (product-id (string-ascii 50)))
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PRODUCT-NOT-FOUND))
    )
    
    ;; Only seller can publish
    (asserts! (is-eq tx-sender (get seller product-data)) ERR-UNAUTHORIZED)
    
    ;; Update status to published
    (map-set products product-id
      (merge product-data {
        status: PRODUCT-PUBLISHED,
        updated-at: block-height
      })
    )
    
    (ok true)
  )
)

;; Grant Access Function (called after successful payment)
(define-public (grant-access
    (product-id (string-ascii 50))
    (buyer principal)
    (max-downloads uint)
  )
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PRODUCT-NOT-FOUND))
    )
    
    ;; Only seller or contract owner can grant access
    (asserts! (or (is-eq tx-sender (get seller product-data))
                  (is-eq tx-sender CONTRACT-OWNER)) ERR-UNAUTHORIZED)
    
    ;; Check if already purchased
    (asserts! (is-none (map-get? product-access {product-id: product-id, buyer: buyer}))
              ERR-ALREADY-PURCHASED)
    
    ;; Grant access
    (map-set product-access {product-id: product-id, buyer: buyer}
      {
        purchased-at: block-height,
        download-count: u0,
        max-downloads: max-downloads,
        expires-at: none
      }
    )
    
    ;; Update product download count
    (map-set products product-id
      (merge product-data {
        download-count: (+ (get download-count product-data) u1)
      })
    )
    
    ;; Update seller stats
    (update-seller-stats (get seller product-data) u0 u1 (get price product-data))
    
    (ok true)
  )
)

;; Record Download Function
(define-public (record-download (product-id (string-ascii 50)))
  (let
    (
      (access-data (unwrap! (map-get? product-access {product-id: product-id, buyer: tx-sender})
                           ERR-ACCESS-DENIED))
    )
    
    ;; Check download limits
    (asserts! (< (get download-count access-data) (get max-downloads access-data))
              ERR-ACCESS-DENIED)
    
    ;; Update download count
    (map-set product-access {product-id: product-id, buyer: tx-sender}
      (merge access-data {
        download-count: (+ (get download-count access-data) u1)
      })
    )
    
    (ok true)
  )
)

;; Add Review Function
(define-public (add-review
    (product-id (string-ascii 50))
    (rating uint)
    (comment (string-ascii 500))
  )
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PRODUCT-NOT-FOUND))
      (has-access (is-some (map-get? product-access {product-id: product-id, buyer: tx-sender})))
    )
    
    ;; Validate rating
    (asserts! (and (>= rating u1) (<= rating u5)) ERR-INVALID-PRICE)
    
    ;; Create review
    (map-set product-reviews {product-id: product-id, reviewer: tx-sender}
      {
        rating: rating,
        comment: comment,
        created-at: block-height,
        verified-purchase: has-access
      }
    )
    
    ;; Update product rating
    (try! (update-product-rating product-id))
    
    (ok true)
  )
)

;; Feature Product Function (admin only)
(define-public (feature-product (product-id (string-ascii 50)) (featured bool))
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PRODUCT-NOT-FOUND))
    )
    
    ;; Only contract owner can feature products
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    
    (map-set products product-id
      (merge product-data { featured: featured })
    )
    
    (ok true)
  )
)

;; Internal helper functions

;; Update seller stats
(define-private (update-seller-stats (seller principal) (products-delta uint) (sales-delta uint) (revenue-delta uint))
  (let
    (
      (current-stats (default-to 
        {
          total-products: u0,
          total-sales: u0,
          total-revenue: u0,
          avg-rating: u0,
          joined-at: block-height
        }
        (map-get? seller-stats seller)))
    )
    
    (map-set seller-stats seller
      {
        total-products: (+ (get total-products current-stats) products-delta),
        total-sales: (+ (get total-sales current-stats) sales-delta),
        total-revenue: (+ (get total-revenue current-stats) revenue-delta),
        avg-rating: (get avg-rating current-stats),
        joined-at: (get joined-at current-stats)
      }
    )
    (ok true)
  )
)

;; Update category product count
(define-private (update-category-count (category (string-ascii 50)) (delta uint))
  (let
    (
      (current-category (default-to
        {
          name: category,
          description: "",
          product-count: u0,
          active: true
        }
        (map-get? categories category)))
    )
    
    (map-set categories category
      (merge current-category {
        product-count: (+ (get product-count current-category) delta)
      })
    )
    (ok true)
  )
)

;; Update product rating (complex calculation)
(define-private (update-product-rating (product-id (string-ascii 50)))
  (let
    (
      (product-data (unwrap! (map-get? products product-id) ERR-PRODUCT-NOT-FOUND))
    )
    
    ;; Simplified rating update - in practice would calculate average from all reviews
    (map-set products product-id
      (merge product-data {
        review-count: (+ (get review-count product-data) u1)
      })
    )
    (ok true)
  )
)

;; Read-only functions

;; Get product details
(define-read-only (get-product (product-id (string-ascii 50)))
  (map-get? products product-id)
)

;; Check if user has access to product
(define-read-only (has-product-access (product-id (string-ascii 50)) (buyer principal))
  (is-some (map-get? product-access {product-id: product-id, buyer: buyer}))
)

;; Get product access details
(define-read-only (get-product-access (product-id (string-ascii 50)) (buyer principal))
  (map-get? product-access {product-id: product-id, buyer: buyer})
)

;; Get product review
(define-read-only (get-review (product-id (string-ascii 50)) (reviewer principal))
  (map-get? product-reviews {product-id: product-id, reviewer: reviewer})
)

;; Get seller stats
(define-read-only (get-seller-stats (seller principal))
  (map-get? seller-stats seller)
)

;; Get category info
(define-read-only (get-category (category (string-ascii 50)))
  (map-get? categories category)
)

;; Get product counter
(define-read-only (get-product-counter)
  (var-get product-counter)
)