package com.example.kiosq.dto;

import java.math.BigDecimal;

public record CreateEscrowOrderRequest(
    String productSlug,
    BigDecimal agreedAmount,
    String buyerName,
    String buyerPhone,
    String deliveryAddress
) {}
