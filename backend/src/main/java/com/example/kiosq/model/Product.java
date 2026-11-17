package com.example.kiosq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal askingPrice;

    @Column(nullable = false)
    private BigDecimal floorPrice; // Minimum price accepted by AI haggler (never shown to buyer)

    @Column(columnDefinition = "TEXT")
    private String whatsappCaption;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    private int viewCount = 0;
    private int offerCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAskingPrice() { return askingPrice; }
    public void setAskingPrice(BigDecimal askingPrice) { this.askingPrice = askingPrice; }

    public BigDecimal getFloorPrice() { return floorPrice; }
    public void setFloorPrice(BigDecimal floorPrice) { this.floorPrice = floorPrice; }

    public String getWhatsappCaption() { return whatsappCaption; }
    public void setWhatsappCaption(String whatsappCaption) { this.whatsappCaption = whatsappCaption; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Merchant getMerchant() { return merchant; }
    public void setMerchant(Merchant merchant) { this.merchant = merchant; }

    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }

    public int getOfferCount() { return offerCount; }
    public void setOfferCount(int offerCount) { this.offerCount = offerCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
