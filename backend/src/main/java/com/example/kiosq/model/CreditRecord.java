package com.example.kiosq.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_records")
public class CreditRecord {

    public enum RecordType {
        SALE_FULFILLED,
        ESCROW_DEPOSIT,
        PAYOUT_DISBURSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private EscrowOrder order;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordType recordType;

    @Column(nullable = false)
    private String auditHash; // Immutable cryptographic audit fingerprint for credit bureaus

    private String description;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public CreditRecord() {}

    public CreditRecord(Merchant merchant, EscrowOrder order, BigDecimal amount, RecordType recordType, String auditHash, String description) {
        this.merchant = merchant;
        this.order = order;
        this.amount = amount;
        this.recordType = recordType;
        this.auditHash = auditHash;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Merchant getMerchant() { return merchant; }
    public void setMerchant(Merchant merchant) { this.merchant = merchant; }

    public EscrowOrder getOrder() { return order; }
    public void setOrder(EscrowOrder order) { this.order = order; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public RecordType getRecordType() { return recordType; }
    public void setRecordType(RecordType recordType) { this.recordType = recordType; }

    public String getAuditHash() { return auditHash; }
    public void setAuditHash(String auditHash) { this.auditHash = auditHash; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
