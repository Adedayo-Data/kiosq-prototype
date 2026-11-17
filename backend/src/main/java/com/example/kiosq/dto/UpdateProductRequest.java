package com.example.kiosq.dto;

import java.math.BigDecimal;

public record UpdateProductRequest(
    String title,
    BigDecimal askingPrice,
    BigDecimal floorPrice,
    String description,
    String whatsappCaption,
    String imageUrl
) {}
