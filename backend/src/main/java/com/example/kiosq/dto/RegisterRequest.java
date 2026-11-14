package com.example.kiosq.dto;

public record RegisterRequest(
    String fullName,
    String phone,
    String email,
    String password,
    String businessName,
    String marketLocation
) {}
