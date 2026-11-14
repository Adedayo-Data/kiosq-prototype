package com.example.kiosq.dto;

import java.math.BigDecimal;

public record CreateProductRequest(
    String title,
    String description,
    BigDecimal askingPrice,
    BigDecimal floorPrice,
    String category,
    String imageUrl,
    String whatsappCaption,
    Long merchantId
) {}
