package com.example.kiosq.dto;

import java.math.BigDecimal;

public record NegotiationResponse(
    String status, // "ACCEPTED", "COUNTERED", "REJECTED"
    BigDecimal offeredPrice,
    String replyMessage,
    boolean isDealLocked,
    String escrowCheckoutUrl
) {}
