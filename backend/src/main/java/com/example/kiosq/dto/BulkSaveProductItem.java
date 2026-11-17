package com.example.kiosq.dto;

import java.math.BigDecimal;
import java.util.List;

public record BulkSaveProductItem(
    String title,
    String description,
    BigDecimal askingPrice,
    BigDecimal floorPrice,
    String imageUrl,
    String whatsappCaption,
    String slug
) {}
