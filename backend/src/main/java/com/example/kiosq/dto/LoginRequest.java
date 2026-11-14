package com.example.kiosq.dto;

public record LoginRequest(
    String phone,
    String password
) {}
