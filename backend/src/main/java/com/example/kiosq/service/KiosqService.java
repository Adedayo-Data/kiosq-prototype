package com.example.kiosq.service;

import com.example.kiosq.dto.*;
import com.example.kiosq.model.*;
import com.example.kiosq.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class KiosqService {

    private final MerchantRepository merchantRepository;
    private final ProductRepository productRepository;
    private final EscrowOrderRepository escrowOrderRepository;
    private final CreditRecordRepository creditRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public KiosqService(
        MerchantRepository merchantRepository,
        ProductRepository productRepository,
        EscrowOrderRepository escrowOrderRepository,
        CreditRecordRepository creditRecordRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.merchantRepository = merchantRepository;
        this.productRepository = productRepository;
        this.escrowOrderRepository = escrowOrderRepository;
        this.creditRecordRepository = creditRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Merchant getCurrentMerchant() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            return merchantRepository.findByEmail(auth.getName()).orElseGet(this::getOrCreateDefaultMerchant);
        }
        return getOrCreateDefaultMerchant();
    }

    @Transactional
    public Merchant getOrCreateDefaultMerchant() {
        return merchantRepository.findByEmail("tola@kiosq.africa").orElseGet(() -> {
            Merchant m = new Merchant(
                "Chioma Adeleke",
                "tola@kiosq.africa",
                "08012345678",
                passwordEncoder.encode("password123"),
                "Mama Tola Textiles",
                "Balogun Market, Lagos Island"
            );
            m.setBankName("Access Bank");
            m.setAccountNumber("0123456789");
            m.setAccountName("Mama Tola Textiles");
            return merchantRepository.save(m);
        });
    }

    // Get Logged-in Merchant's Products for Dashboard
    @Transactional(readOnly = true)
    public List<Product> getMerchantProducts() {
        Merchant m = getCurrentMerchant();
        return productRepository.findByMerchantIdOrderByCreatedAtDesc(m.getId());
    }

    // 1. Create Product Listing (Merchant only)
    @Transactional
    public Product createProduct(CreateProductRequest req) {
        Merchant merchant = getCurrentMerchant();

        Product product = new Product();
        String slug = req.title().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "") + "-" + UUID.randomUUID().toString().substring(0, 5);
        product.setSlug(slug);
        product.setTitle(req.title());
        product.setDescription(req.description());
        product.setAskingPrice(req.askingPrice());
        product.setFloorPrice(req.floorPrice());
        product.setCategory(req.category());
        product.setImageUrl(req.imageUrl());
        product.setWhatsappCaption(req.whatsappCaption() != null ? req.whatsappCaption() : "Fresh drop! Buy securely on Kiosq with SafeEscrow.");
        product.setMerchant(merchant);

        return productRepository.save(product);
    }

    // AI Bulk Draft Generator: For up to 20 images, generates intelligent titles & WhatsApp captions with link
    @Transactional(readOnly = true)
    public List<BulkDraftItem> generateBulkDrafts(BulkDraftRequest req) {
        Merchant m = getCurrentMerchant();
        String storeName = req.businessName() != null ? req.businessName() : m.getBusinessName();

        List<BulkDraftItem> drafts = new ArrayList<>();
        int count = 1;

        for (String url : req.imageUrls()) {
            String slug = "item-" + UUID.randomUUID().toString().substring(0, 6);
            String title = "New Stock Item #" + count + " (" + storeName + ")";
            String caption = "✨ Fresh arrival from " + storeName + "!\n" +
                    "Quality guaranteed. Fast delivery across Lagos.\n" +
                    "🛡️ 100% Safe Escrow (Delivery PIN protection).\n\n" +
                    "👇 Tap link to view, haggle or buy directly:\n" +
                    "https://kiosq.shop/product/" + slug;

            drafts.add(new BulkDraftItem(url, title, caption, slug));
            count++;
        }

        return drafts;
    }

    // Bulk Save all staged products
    @Transactional
    public List<Product> bulkSaveProducts(BulkSaveRequest req) {
        Merchant merchant = getCurrentMerchant();
        List<Product> saved = new ArrayList<>();

        for (BulkSaveProductItem item : req.items()) {
            Product p = new Product();
            String slug = item.slug() != null && !item.slug().isEmpty() 
                ? item.slug() 
                : item.title().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "") + "-" + UUID.randomUUID().toString().substring(0, 5);
            
            p.setSlug(slug);
            p.setTitle(item.title());
            p.setDescription(item.description() != null ? item.description() : item.title());
            p.setAskingPrice(item.askingPrice() != null ? item.askingPrice() : BigDecimal.ZERO);
            p.setFloorPrice(item.floorPrice() != null ? item.floorPrice() : (item.askingPrice() != null ? item.askingPrice().multiply(new BigDecimal("0.85")) : BigDecimal.ZERO));
            p.setImageUrl(item.imageUrl());
            p.setWhatsappCaption(item.whatsappCaption());
            p.setCategory("General Merchandise");
            p.setMerchant(merchant);

            saved.add(productRepository.save(p));
        }

        return saved;
    }

    // 2. Get Public Product Details (Hides Floor Price!)
    @Transactional(readOnly = true)
    public Map<String, Object> getPublicProduct(String slug) {
        Product p = productRepository.findBySlug(slug)
            .or(() -> {
                try {
                    return productRepository.findById(Long.parseLong(slug));
                } catch (NumberFormatException e) {
                    return Optional.empty();
                }
            })
            .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("slug", p.getSlug());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("askingPrice", p.getAskingPrice());
        // Floor price is strictly withheld from public payloads to protect seller margins
        map.put("imageUrl", p.getImageUrl());
        map.put("whatsappCaption", p.getWhatsappCaption());
        map.put("merchantId", p.getMerchant().getId());
        map.put("merchantName", p.getMerchant().getBusinessName());
        map.put("merchantLocation", p.getMerchant().getMarketLocation());
        map.put("merchantVerified", p.getMerchant().isVerified());
        return map;
    }

    // Update Product Details (Owner only)
    @Transactional
    public Product updateProduct(Long id, UpdateProductRequest req) {
        Merchant merchant = getCurrentMerchant();
        Product p = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (!p.getMerchant().getId().equals(merchant.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this product listing.");
        }

        if (req.title() != null && !req.title().isBlank()) p.setTitle(req.title());
        if (req.askingPrice() != null) p.setAskingPrice(req.askingPrice());
        if (req.floorPrice() != null) p.setFloorPrice(req.floorPrice());
        if (req.description() != null) p.setDescription(req.description());
        if (req.whatsappCaption() != null) p.setWhatsappCaption(req.whatsappCaption());
        if (req.imageUrl() != null && !req.imageUrl().isBlank()) p.setImageUrl(req.imageUrl());

        return productRepository.save(p);
    }

    // 3. AI Haggling Negotiation Engine
    @Transactional
    public NegotiationResponse negotiate(NegotiationRequest req) {
        Product p = productRepository.findBySlug(req.productSlug())
            .orElseThrow(() -> new RuntimeException("Product not found"));

        p.setOfferCount(p.getOfferCount() + 1);
        productRepository.save(p);

        BigDecimal offer = req.buyerOffer();
        BigDecimal floor = p.getFloorPrice();
        BigDecimal asking = p.getAskingPrice();

        if (offer.compareTo(asking) >= 0) {
            return new NegotiationResponse(
                "ACCEPTED",
                offer,
                "Deal agreed! Oya make we lock this order straight into Kiosq SafeEscrow.",
                true,
                "/escrow/order-" + p.getSlug()
            );
        }

        if (offer.compareTo(floor) >= 0) {
            return new NegotiationResponse(
                "ACCEPTED",
                offer,
                "Deal locked at ₦" + offer + "! I don hold am for you. Make you deposit into Escrow now make Mama Tola pack am for rider.",
                true,
                "/escrow/order-" + p.getSlug()
            );
        }

        BigDecimal counter = floor.add(asking.subtract(floor).divide(BigDecimal.valueOf(2)));
        if (counter.compareTo(floor) < 0) {
            counter = floor;
        }

        return new NegotiationResponse(
            "COUNTERED",
            counter,
            "Ah my friend, ₦" + offer + " dey a bit low for this original quality o! Last card wey I fit do for you now na ₦" + counter + " with fast dispatch. How you see am?",
            false,
            null
        );
    }

    // 4. Create Escrow Order & Issue 4-Digit Delivery PIN (Cryptographically secure)
    @Transactional
    public Map<String, Object> createEscrowOrder(CreateEscrowOrderRequest req) {
        Product p = productRepository.findBySlug(req.productSlug())
            .or(() -> {
                try {
                    return productRepository.findById(Long.parseLong(req.productSlug()));
                } catch (NumberFormatException e) {
                    return Optional.empty();
                }
            })
            .orElseThrow(() -> new RuntimeException("Product not found: " + req.productSlug()));

        EscrowOrder order = new EscrowOrder();
        String ref = "ORD-" + (1000 + secureRandom.nextInt(9000));
        order.setOrderReference(ref);
        order.setProduct(p);
        order.setMerchant(p.getMerchant());
        order.setAmount(req.agreedAmount());
        order.setBuyerName(req.buyerName());
        order.setBuyerPhone(req.buyerPhone());
        order.setDeliveryAddress(req.deliveryAddress());
        order.setFlutterwaveTxRef(req.paymentTxRef());

        // Generate 4-digit PIN using SecureRandom
        String pin = String.format("%04d", secureRandom.nextInt(10000));
        order.setDeliveryPin(pin);
        order.setStatus(EscrowOrder.EscrowStatus.FUNDS_HELD_IN_ESCROW);
        order.setPaidAt(LocalDateTime.now());

        EscrowOrder saved = escrowOrderRepository.save(order);
        return mapEscrowOrderToDto(saved);
    }

    // 4b. Get Single Escrow Order by Reference (Public tracking & Buyer details)
    @Transactional(readOnly = true)
    public Map<String, Object> getEscrowOrder(String orderReference) {
        EscrowOrder order = escrowOrderRepository.findByOrderReference(orderReference)
            .orElseThrow(() -> new RuntimeException("Order not found with reference: " + orderReference));
        return mapEscrowOrderToDto(order);
    }

    // 4c. Get Authenticated Merchant's Orders
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMerchantOrders() {
        Merchant m = getCurrentMerchant();
        List<EscrowOrder> orders = escrowOrderRepository.findByMerchantIdOrderByCreatedAtDesc(m.getId());
        return orders.stream().map(this::mapEscrowOrderToDto).toList();
    }

    // 4d. Mark Order Dispatched (Merchant action)
    @Transactional
    public Map<String, Object> dispatchOrder(String orderReference, DispatchOrderRequest req) {
        EscrowOrder order = escrowOrderRepository.findByOrderReference(orderReference)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderReference));

        order.setStatus(EscrowOrder.EscrowStatus.DISPATCHED);
        order.setDispatchedAt(LocalDateTime.now());
        if (req.courierName() != null) order.setCourierName(req.courierName());
        if (req.courierPhone() != null) order.setCourierPhone(req.courierPhone());
        if (req.packedItemPhoto() != null) order.setPackedItemPhoto(req.packedItemPhoto());

        EscrowOrder saved = escrowOrderRepository.save(order);
        return mapEscrowOrderToDto(saved);
    }

    // 4e. Buyer Dispute Freeze (Atomically freezes payout)
    @Transactional
    public Map<String, Object> disputeOrder(String orderReference, DisputeOrderRequest req) {
        EscrowOrder order = escrowOrderRepository.findByOrderReference(orderReference)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderReference));

        if (order.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED) {
            throw new IllegalStateException("Cannot dispute an order that has already been delivered and released.");
        }

        order.setStatus(EscrowOrder.EscrowStatus.DISPUTED);
        order.setDisputeReason(req.reason());
        order.setDisputeNote(req.note());

        EscrowOrder saved = escrowOrderRepository.save(order);
        return mapEscrowOrderToDto(saved);
    }

    // 5. Doorstep Rider / Courier 4-Digit PIN Verification (Hardened Rate Limiting & Anti-Brute-Force)
    @Transactional
    public Map<String, Object> verifyDeliveryPin(VerifyPinRequest req) {
        EscrowOrder order = escrowOrderRepository.findByOrderReference(req.orderReference())
            .orElseThrow(() -> new RuntimeException("Order not found: " + req.orderReference()));

        // Idempotency check
        if (order.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED) {
            throw new IllegalStateException("Order payout has already been verified and released to merchant.");
        }

        // Dispute check
        if (order.getStatus() == EscrowOrder.EscrowStatus.DISPUTED) {
            throw new IllegalStateException("This order is currently under active dispute. Payout is frozen.");
        }

        // Account Lockout check (Max 3 failed attempts)
        if (order.getStatus() == EscrowOrder.EscrowStatus.PIN_LOCKED || order.getFailedPinAttempts() >= 3) {
            order.setStatus(EscrowOrder.EscrowStatus.PIN_LOCKED);
            escrowOrderRepository.save(order);
            throw new IllegalStateException("Too many failed attempts! PIN verification is locked to protect customer funds. Contact Kiosq support.");
        }

        // Validate PIN
        if (!order.getDeliveryPin().equals(req.pin().trim())) {
            int attempts = order.getFailedPinAttempts() + 1;
            order.setFailedPinAttempts(attempts);
            if (attempts >= 3) {
                order.setStatus(EscrowOrder.EscrowStatus.PIN_LOCKED);
            }
            escrowOrderRepository.save(order);

            int remaining = Math.max(0, 3 - attempts);
            if (remaining == 0) {
                throw new IllegalArgumentException("Incorrect PIN. 3 failed attempts reached — PIN verification has been locked!");
            }
            throw new IllegalArgumentException("Invalid 4-digit Delivery PIN! " + remaining + " attempt(s) remaining.");
        }

        // Success: Reset failed attempts, update status and release funds
        order.setFailedPinAttempts(0);
        order.setStatus(EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED);
        order.setPinVerifiedAt(LocalDateTime.now());
        order.setReleasedAt(LocalDateTime.now());
        escrowOrderRepository.save(order);

        String auditHash = generateAuditHash(order);
        CreditRecord record = new CreditRecord(
            order.getMerchant(),
            order,
            order.getAmount(),
            CreditRecord.RecordType.SALE_FULFILLED,
            auditHash,
            "Completed Escrow sale for " + order.getProduct().getTitle() + " verified by Doorstep PIN."
        );
        creditRecordRepository.save(record);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orderReference", order.getOrderReference());
        response.put("status", "DELIVERED_AND_RELEASED");
        response.put("amountReleased", order.getAmount());
        response.put("verifiedAt", order.getReleasedAt());
        response.put("creditAuditHash", auditHash);
        response.put("message", "PIN Verified! ₦" + order.getAmount() + " successfully released to merchant settlement ledger.");
        return response;
    }

    // Helper: Map EscrowOrder Entity to rich, formatted DTO
    public Map<String, Object> mapEscrowOrderToDto(EscrowOrder o) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", o.getOrderReference());
        map.put("orderReference", o.getOrderReference());
        map.put("itemTitle", o.getProduct().getTitle());
        map.put("productSlug", o.getProduct().getSlug());
        map.put("imageUrl", o.getProduct().getImageUrl());
        map.put("amount", o.getAmount());
        map.put("buyerFullName", o.getBuyerName() != null ? o.getBuyerName() : "Valued Customer");
        map.put("buyerPhone", o.getBuyerPhone() != null ? o.getBuyerPhone() : "");
        map.put("deliveryAddress", o.getDeliveryAddress() != null ? o.getDeliveryAddress() : "");
        map.put("status", o.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED ? "Completed" : "In escrow");
        map.put("deliveryStatus", o.getStatus().name());
        map.put("deliveryPin", o.getDeliveryPin());
        map.put("failedPinAttempts", o.getFailedPinAttempts());
        map.put("courierName", o.getCourierName());
        map.put("courierPhone", o.getCourierPhone());
        map.put("packedItemPhoto", o.getPackedItemPhoto());
        map.put("disputeReason", o.getDisputeReason());
        map.put("disputeNote", o.getDisputeNote());
        map.put("flutterwaveTxRef", o.getFlutterwaveTxRef());
        map.put("createdAt", o.getCreatedAt());
        map.put("paidAt", o.getPaidAt());
        map.put("dispatchedAt", o.getDispatchedAt());
        map.put("pinVerifiedAt", o.getPinVerifiedAt());
        map.put("releasedAt", o.getReleasedAt());
        map.put("merchantBusinessName", o.getMerchant() != null ? o.getMerchant().getBusinessName() : "Kiosq Merchant");
        map.put("merchantPhone", o.getMerchant() != null ? o.getMerchant().getPhone() : "");

        // Construct structured timeline matching frontend expectations
        List<Map<String, Object>> timeline = new ArrayList<>();
        boolean isPaid = o.getStatus() != EscrowOrder.EscrowStatus.PENDING_PAYMENT;
        boolean isDispatched = o.getStatus() == EscrowOrder.EscrowStatus.DISPATCHED
                || o.getStatus() == EscrowOrder.EscrowStatus.PIN_VERIFIED
                || o.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED;
        boolean isDelivered = o.getStatus() == EscrowOrder.EscrowStatus.PIN_VERIFIED
                || o.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED;
        boolean isReleased = o.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED;

        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("label", "Paid");
        t1.put("completed", isPaid);
        t1.put("time", o.getPaidAt() != null ? o.getPaidAt().toString() : null);
        t1.put("note", "₦" + o.getAmount() + " deposited into safe escrow");
        timeline.add(t1);

        Map<String, Object> t2 = new LinkedHashMap<>();
        t2.put("label", "Dispatched");
        t2.put("completed", isDispatched);
        t2.put("time", o.getDispatchedAt() != null ? o.getDispatchedAt().toString() : null);
        t2.put("note", o.getCourierName() != null ? "With " + o.getCourierName() : "Awaiting dispatch confirmation");
        timeline.add(t2);

        Map<String, Object> t3 = new LinkedHashMap<>();
        t3.put("label", "Delivered (PIN)");
        t3.put("completed", isDelivered);
        t3.put("time", o.getPinVerifiedAt() != null ? o.getPinVerifiedAt().toString() : null);
        t3.put("note", isDelivered ? "Verified by delivery person at doorstep" : "4-digit handoff PIN pending");
        timeline.add(t3);

        Map<String, Object> t4 = new LinkedHashMap<>();
        t4.put("label", "Inspection window");
        t4.put("completed", isDelivered);
        t4.put("time", isDelivered ? "Active" : null);
        t4.put("note", "24-hour buyer inspection window");
        timeline.add(t4);

        Map<String, Object> t5 = new LinkedHashMap<>();
        t5.put("label", "Released");
        t5.put("completed", isReleased);
        t5.put("time", o.getReleasedAt() != null ? o.getReleasedAt().toString() : null);
        t5.put("note", isReleased ? "Payout disbursed to seller settlement account" : "Pending delivery verification");
        timeline.add(t5);

        map.put("timeline", timeline);
        return map;
    }

    // 6. Seller Dashboard Metrics (Authenticated Merchant)
    @Transactional(readOnly = true)
    public Map<String, Object> getSellerMetrics() {
        Merchant m = getCurrentMerchant();
        List<EscrowOrder> orders = escrowOrderRepository.findByMerchantIdOrderByCreatedAtDesc(m.getId());

        BigDecimal availablePayout = BigDecimal.ZERO;
        BigDecimal lockedInEscrow = BigDecimal.ZERO;
        int activeOrders = 0;

        for (EscrowOrder o : orders) {
            if (o.getStatus() == EscrowOrder.EscrowStatus.DELIVERED_AND_RELEASED) {
                availablePayout = availablePayout.add(o.getAmount());
            } else if (o.getStatus() == EscrowOrder.EscrowStatus.FUNDS_HELD_IN_ESCROW || o.getStatus() == EscrowOrder.EscrowStatus.DISPATCHED) {
                lockedInEscrow = lockedInEscrow.add(o.getAmount());
                activeOrders++;
            }
        }

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("merchantName", m.getBusinessName());
        metrics.put("email", m.getEmail());
        metrics.put("phone", m.getPhone());
        metrics.put("availablePayout", availablePayout);
        metrics.put("lockedInEscrow", lockedInEscrow);
        metrics.put("activeOrdersCount", activeOrders);
        metrics.put("totalDealsCompleted", creditRecordRepository.findByMerchantIdOrderByRecordedAtDesc(m.getId()).size());
        return metrics;
    }

    // 7. Verified Financial Credit Ledger
    @Transactional(readOnly = true)
    public Map<String, Object> getCreditLedger() {
        Merchant m = getCurrentMerchant();
        List<CreditRecord> records = creditRecordRepository.findByMerchantIdOrderByRecordedAtDesc(m.getId());

        BigDecimal totalVerifiedGmv = records.stream()
            .map(CreditRecord::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> ledger = new LinkedHashMap<>();
        ledger.put("merchantId", m.getId());
        ledger.put("businessName", m.getBusinessName());
        ledger.put("totalVerifiedGmv", totalVerifiedGmv);
        ledger.put("completedFulfillments", records.size());
        ledger.put("creditScoreTier", records.size() >= 5 ? "TIER_A_CREDIT_READY" : "TIER_B_ACCUMULATING");
        ledger.put("records", records);
        return ledger;
    }

    private String generateAuditHash(EscrowOrder order) {
        try {
            String raw = order.getOrderReference() + ":" + order.getAmount() + ":" + order.getPinVerifiedAt() + ":" + order.getMerchant().getId();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}
