package com.example.kiosq.dto;

public record RegisterRequest(
    String fullName,
    String email,
    String phone,
    String password,
    String businessName,
    String marketLocation
) {}
