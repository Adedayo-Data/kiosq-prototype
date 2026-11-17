package com.example.kiosq.dto;

public record AuthResponse(
    String token,
    Long merchantId,
    String businessName,
    String email,
    String phone,
    String message
) {}
