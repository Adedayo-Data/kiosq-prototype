package com.example.kiosq.dto;

import java.math.BigDecimal;

public record NegotiationRequest(
    String productSlug,
    BigDecimal buyerOffer,
    String buyerMessage
) {}
