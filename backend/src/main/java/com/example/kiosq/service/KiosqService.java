package com.example.kiosq.service;

import com.example.kiosq.dto.*;
import com.example.kiosq.model.*;
import com.example.kiosq.repository.*;
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

    public KiosqService(
        MerchantRepository merchantRepository,
        ProductRepository productRepository,
        EscrowOrderRepository escrowOrderRepository,
        CreditRecordRepository creditRecordRepository
    ) {
        this.merchantRepository = merchantRepository;
        this.productRepository = productRepository;
        this.escrowOrderRepository = escrowOrderRepository;
        this.creditRecordRepository = creditRecordRepository;
    }

    // Default Seed Merchant: Mama Tola Textiles
    @Transactional
    public Merchant getOrCreateDefaultMerchant() {
        return merchantRepository.findByPhone("08012345678").orElseGet(() -> {
            Merchant m = new Merchant("Chioma Adeleke", "08012345678", "tola@kiosq.africa", "Mama Tola Textiles", "Balogun Market, Lagos Island");
            m.setBankName("Access Bank");
            m.setAccountNumber("0123456789");
            m.setAccountName("Mama Tola Textiles");
            return merchantRepository.save(m);
        });
    }

    // 1. Create Product Listing
    @Transactional
    public Product createProduct(CreateProductRequest req) {
        Merchant merchant = getOrCreateDefaultMerchant();

        Product product = new Product();
        String slug = req.title().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "") + "-" + UUID.randomUUID().toString().substring(0, 5);
        product.setSlug(slug);
        product.setTitle(req.title());
        product.setDescription(req.description());
        product.setAskingPrice(req.askingPrice());
        product.setFloorPrice(req.floorPrice());
        product.setCategory(req.category());
        product.setImageUrl(req.imageUrl() != null ? req.imageUrl() : "https://lh3.googleusercontent.com/aida-public/AB6AXuAKJfLOn4VRMScTfJqlEtJ9M39g70YXxZSSZ_RABRROV5nCaPrT3yV6Wq_Vl8zH-V3eJ4P-L1-mN3cZ4w-yC1IleipBYtXwlQXYnpWwU_RfpkZ-Xq7H98UQCRsDDdapHalEW4ppP5GV745cCobx5RsGWN-LNxGPBKqAb4Rn3eIuHpI0Z-yb4XeS-HkIc0S1898uDkibmN2nxznGb-CK-AZ6x8D");
        product.setWhatsappCaption(req.whatsappCaption() != null ? req.whatsappCaption() : "Fresh drop! Buy securely on Kiosq with SafeEscrow.");
        product.setMerchant(merchant);

        return productRepository.save(product);
    }

    // 2. Get Public Product Details (Hides Floor Price!)
    @Transactional(readOnly = true)
    public Map<String, Object> getPublicProduct(String slug) {
        Product p = productRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("slug", p.getSlug());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("askingPrice", p.getAskingPrice());
        // Floor price is intentionally OMITTED for buyer security
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

        // Rule 1: Offer meets or exceeds asking price
        if (offer.compareTo(asking) >= 0) {
            return new NegotiationResponse(
                "ACCEPTED",
                offer,
                "Deal agreed! Oya make we lock this order straight into Kiosq SafeEscrow.",
                true,
                "/escrow/order-" + p.getSlug()
            );
        }

        // Rule 2: Offer meets or exceeds minimum floor price
        if (offer.compareTo(floor) >= 0) {
            return new NegotiationResponse(
                "ACCEPTED",
                offer,
                "Deal locked at ₦" + offer + "! I don hold am for you. Make you deposit into Escrow now make Mama Tola pack am for rider.",
                true,
                "/escrow/order-" + p.getSlug()
            );
        }

        // Rule 3: Offer is below floor price -> AI Counter-offers with Floor
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

        // Generate 4-Digit Doorstep Delivery PIN (e.g. 7429)
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

        // Turn completed transaction into verified financial record for credit readiness
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

    // 6. Seller Dashboard Metrics
    @Transactional(readOnly = true)
    public Map<String, Object> getSellerMetrics() {
        Merchant m = getOrCreateDefaultMerchant();
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
        metrics.put("availablePayout", availablePayout);
        metrics.put("lockedInEscrow", lockedInEscrow);
        metrics.put("activeOrdersCount", activeOrders);
        metrics.put("totalDealsCompleted", creditRecordRepository.findByMerchantIdOrderByRecordedAtDesc(m.getId()).size());
        return metrics;
    }

    // 7. Verified Financial Credit Ledger (Financial Passport)
    @Transactional(readOnly = true)
    public Map<String, Object> getCreditLedger() {
        Merchant m = getOrCreateDefaultMerchant();
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
