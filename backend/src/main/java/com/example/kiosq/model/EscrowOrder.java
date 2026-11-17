package com.example.kiosq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow_orders")
public class EscrowOrder {

    public enum EscrowStatus {
        PENDING_PAYMENT,
        FUNDS_HELD_IN_ESCROW, // Buyer deposit received, safe in pool
        DISPATCHED,           // Rider on the way
        PIN_VERIFIED,         // Physical handoff confirmed by 4-digit PIN
        DELIVERED_AND_RELEASED, // Payout disbursed to seller ledger
        DISPUTED              // Payout frozen by buyer inspection report
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderReference; // e.g. ORD-4821

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    private String buyerName;
    private String buyerPhone;
    private String deliveryAddress;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 4)
    private String deliveryPin; // 4-digit physical handoff PIN (e.g. "7429")

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscrowStatus status = EscrowStatus.PENDING_PAYMENT;

    private LocalDateTime paidAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime pinVerifiedAt;
    private LocalDateTime releasedAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    public EscrowOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderReference() { return orderReference; }
    public void setOrderReference(String orderReference) { this.orderReference = orderReference; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Merchant getMerchant() { return merchant; }
    public void setMerchant(Merchant merchant) { this.merchant = merchant; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDeliveryPin() { return deliveryPin; }
    public void setDeliveryPin(String deliveryPin) { this.deliveryPin = deliveryPin; }

    public EscrowStatus getStatus() { return status; }
    public void setStatus(EscrowStatus status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public LocalDateTime getPinVerifiedAt() { return pinVerifiedAt; }
    public void setPinVerifiedAt(LocalDateTime pinVerifiedAt) { this.pinVerifiedAt = pinVerifiedAt; }

    public LocalDateTime getReleasedAt() { return releasedAt; }
    public void setReleasedAt(LocalDateTime releasedAt) { this.releasedAt = releasedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
