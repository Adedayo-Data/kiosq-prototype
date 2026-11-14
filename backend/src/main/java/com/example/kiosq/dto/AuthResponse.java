package com.example.kiosq.dto;

public record AuthResponse(
    String token,
    Long merchantId,
    String businessName,
    String phone,
    String message
) {}
