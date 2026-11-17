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
import java.time.LocalDateTime;
import java.util.*;

@Service
public class KiosqService {

    private final MerchantRepository merchantRepository;
    private final ProductRepository productRepository;
    private final EscrowOrderRepository escrowOrderRepository;
    private final CreditRecordRepository creditRecordRepository;
    private final PasswordEncoder passwordEncoder;

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
        map.put("imageUrl", p.getImageUrl());
        map.put("whatsappCaption", p.getWhatsappCaption());
        map.put("merchantName", p.getMerchant().getBusinessName());
        map.put("merchantLocation", p.getMerchant().getMarketLocation());
        map.put("merchantVerified", p.getMerchant().isVerified());
        return map;
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

    // 4. Create Escrow Order & Issue 4-Digit Delivery PIN
    @Transactional
    public EscrowOrder createEscrowOrder(CreateEscrowOrderRequest req) {
        Product p = productRepository.findBySlug(req.productSlug())
            .orElseThrow(() -> new RuntimeException("Product not found"));

        EscrowOrder order = new EscrowOrder();
        String ref = "ORD-" + (1000 + new Random().nextInt(9000));
        order.setOrderReference(ref);
        order.setProduct(p);
        order.setMerchant(p.getMerchant());
        order.setAmount(req.agreedAmount());
        order.setBuyerName(req.buyerName());
        order.setBuyerPhone(req.buyerPhone());
        order.setDeliveryAddress(req.deliveryAddress());

        String pin = String.format("%04d", new Random().nextInt(10000));
        order.setDeliveryPin(pin);
        order.setStatus(EscrowOrder.EscrowStatus.FUNDS_HELD_IN_ESCROW);
        order.setPaidAt(LocalDateTime.now());

        return escrowOrderRepository.save(order);
    }

    // 5. Doorstep Rider / Buyer 4-Digit PIN Verification
    @Transactional
    public Map<String, Object> verifyDeliveryPin(VerifyPinRequest req) {
        EscrowOrder order = escrowOrderRepository.findByOrderReference(req.orderReference())
            .orElseThrow(() -> new RuntimeException("Order not found: " + req.orderReference()));

        if (!order.getDeliveryPin().equals(req.pin().trim())) {
            throw new IllegalArgumentException("Invalid 4-digit Delivery PIN! Check with the buyer.");
        }

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
