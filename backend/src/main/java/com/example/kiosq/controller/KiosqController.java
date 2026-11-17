package com.example.kiosq.controller;

import com.example.kiosq.dto.*;
import com.example.kiosq.model.*;
import com.example.kiosq.service.KiosqService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class KiosqController {

    private final KiosqService kiosqService;

    public KiosqController(KiosqService kiosqService) {
        this.kiosqService = kiosqService;
    }

    // 1. Get Logged-in Merchant's Products for Dashboard
    @GetMapping({"/products", "/merchant/products"})
    public ResponseEntity<List<Product>> getMerchantProducts() {
        return ResponseEntity.ok(kiosqService.getMerchantProducts());
    }

    // 2. Create Single Product Listing
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody CreateProductRequest req) {
        return ResponseEntity.ok(kiosqService.createProduct(req));
    }

    // 2b. Update Product Listing (Owner only)
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody UpdateProductRequest req) {
        return ResponseEntity.ok(kiosqService.updateProduct(id, req));
    }

    // 3. Generate Bulk AI Titles & Captions with WhatsApp link for up to 20 images
    @PostMapping("/products/bulk-draft")
    public ResponseEntity<List<BulkDraftItem>> generateBulkDrafts(@RequestBody BulkDraftRequest req) {
        return ResponseEntity.ok(kiosqService.generateBulkDrafts(req));
    }

    // 4. Save Multiple Staged Products at Once
    @PostMapping("/products/bulk-save")
    public ResponseEntity<List<Product>> bulkSaveProducts(@RequestBody BulkSaveRequest req) {
        return ResponseEntity.ok(kiosqService.bulkSaveProducts(req));
    }

    // 5. Public Storefront (WhatsApp Link) - Floor price strictly hidden!
    @GetMapping("/products/{slug}")
    public ResponseEntity<Map<String, Object>> getPublicProduct(@PathVariable String slug) {
        return ResponseEntity.ok(kiosqService.getPublicProduct(slug));
    }

    // 6. AI Haggling Engine
    @PostMapping("/negotiations/chat")
    public ResponseEntity<NegotiationResponse> negotiate(@RequestBody NegotiationRequest req) {
        return ResponseEntity.ok(kiosqService.negotiate(req));
    }

    // 7. Create Escrow Order & Issue 4-Digit Delivery PIN
    @PostMapping("/escrow/orders")
    public ResponseEntity<EscrowOrder> createEscrowOrder(@RequestBody CreateEscrowOrderRequest req) {
        return ResponseEntity.ok(kiosqService.createEscrowOrder(req));
    }

    // 8. Doorstep Rider / Buyer 4-Digit Delivery PIN Verification
    @PostMapping("/riders/verify-pin")
    public ResponseEntity<Map<String, Object>> verifyPin(@RequestBody VerifyPinRequest req) {
        return ResponseEntity.ok(kiosqService.verifyDeliveryPin(req));
    }

    // 9. Seller Dashboard Metrics
    @GetMapping("/dashboard/metrics")
    public ResponseEntity<Map<String, Object>> getSellerMetrics() {
        return ResponseEntity.ok(kiosqService.getSellerMetrics());
    }

    // 10. Verified Financial Credit Ledger (Credit Readiness)
    @GetMapping("/dashboard/credit-ledger")
    public ResponseEntity<Map<String, Object>> getCreditLedger() {
        return ResponseEntity.ok(kiosqService.getCreditLedger());
    }
}
